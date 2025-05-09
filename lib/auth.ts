import NextAuth, { type DefaultSession, NextAuthConfig, User } from "next-auth";
import type { Role } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma';
import { isEdgeRuntime, getPrismaEdge } from '@/lib/prisma-edge';
import bcrypt from "bcryptjs";

// Helper function to fetch subscription data - handles Edge Runtime properly
async function getUserSubscriptionData(userId: number) {
  try {
    const inEdgeRuntime = isEdgeRuntime();
    
    // If in Edge Runtime, try to use the edge-compatible client
    if (inEdgeRuntime) {
      try {
        // Use direct database query via serverless adapter instead of Prisma ORM
        // This is a simplified approach that should work in edge runtime
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/subscription?userId=${userId}`, {
          headers: {
            // Add internal API key or other authorization
            'x-internal-api-key': process.env.INTERNAL_API_KEY || 'innobid-internal',
          },
          cache: 'no-store', // Don't cache response
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            subscriptionStatus: data.subscriptionStatus || 'inactive',
            subscriptionTier: data.subscriptionTier,
            subscriptionEndDate: data.subscriptionEndDate,
            updatedAt: new Date(data.updatedAt || Date.now())
          };
        }
      } catch (edgeError) {
        console.error('Edge Runtime subscription data fetch error:', edgeError);
      }
      
      // If the edge approach fails, return default data but clearly indicate it's from Edge Runtime
      console.log('Falling back to cache for subscription data in Edge Runtime');
      return {
        subscriptionStatus: 'edge-runtime',  // Special marker to identify this case
        subscriptionTier: null,
        subscriptionEndDate: null,
        updatedAt: new Date()
      };
    }
    
    // Standard server runtime - use regular prisma client
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true,
        updatedAt: true
      }
    });
    return user;
  } catch (error) {
    console.error(`Error fetching subscription data for user ${userId}:`, error);
    // Always return a default value in case of any error to prevent crashes
    return {
      subscriptionStatus: 'error',
      subscriptionTier: null,
      subscriptionEndDate: null,
      updatedAt: new Date()
    };
  }
}

// Extend default session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      email: string;
      name?: string | null;
      role: string;
      city?: string;
      country?: string;
      postalCode?: string;
      businessType?: string;
      establishmentDate?: string | number | Date;
      address?: string;
      registrationNumber?: string;
      phone?: string;
      company?: string;
      hasActiveSubscription?: boolean;
      subscriptionTier?: string | null;
    } & DefaultSession["user"]
  }

  // Define the User interface for NextAuth internal use
  // Decouple from PrismaUser to avoid requiring all Prisma fields
  interface User {
    id: number; // Keep as number initially, callbacks handle conversion if needed
    name?: string | null;
    email?: string | null;
    role: string; // Include custom role
    // Add other fields ONLY if strictly needed by NextAuth core or early callbacks
    // Subscription details are typically added in the jwt callback
  }
}

// JWT type extension
declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: string;
    id?: number;
    hasActiveSubscription?: boolean;
    subscriptionTier?: string | null;
    subscriptionLastChecked?: number;
    userUpdatedAt?: number; // Timestamp of when the user record was last updated in the database
  }
}

// NextAuth configuration object
export const config: NextAuthConfig = {
  // Add trusted hosts configuration to fix the UntrustedHost error
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Ensure email is a string
        const email = typeof credentials.email === 'string' ? credentials.email : '';
        if (!email) return null;

        const existingUser = await prisma.user.findUnique({
          where: { email: email } // Use validated email
        });

        if (!existingUser || !existingUser.password) { // Also check if user.password exists
          return null;
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          existingUser.password
        );

        if (passwordsMatch) {
          // Return only the core fields defined in the adjusted 'interface User'
          return {
            id: existingUser.id, // Use numeric ID from Prisma
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          };
        }

        // If passwords don't match, return null
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user }: { user: AdapterUser | User }) {
      // Remove verbose logging for security
      return true;
    },
    async jwt({ token, user, trigger }: { token: JWT, user?: AdapterUser | User | undefined, trigger?: "signIn" | "signUp" | "update" | undefined }) {
      // Remove verbose logging for security

      if (user) {
        token.id = Number(user.id);
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Always check subscription status for procurement officers
      if (token.role === 'PROCUREMENT' && token.id) {
        // Fetch the latest subscription data from the database
        const subscriptionData = await getUserSubscriptionData(Number(token.id));
        
        if (subscriptionData) {
          // Handle Edge Runtime special case
          if (subscriptionData.subscriptionStatus === 'edge-runtime') {
            // In Edge Runtime, preserve existing token data rather than resetting it
            // This prevents unnecessary redirects during middleware checks
            
            // IMPORTANT: For Edge middleware, we trust the existing token data
            // If token has no subscription data yet, default to NOT redirecting users to pricing
            // This will let users get to their intended destination after successful payment
            token.hasActiveSubscription = token.hasActiveSubscription ?? true; // Default to true in edge to avoid pricing page loop
            token.subscriptionTier = token.subscriptionTier ?? null;
            token.subscriptionLastChecked = Date.now();
            
            console.log('Edge runtime: preserving token subscription data', { 
              hasActive: token.hasActiveSubscription,
              tier: token.subscriptionTier 
            });
          } else {
            // Normal path for server components and API routes
            // Check if subscription is active and not expired
            const isActive = subscriptionData.subscriptionStatus === 'active';
            const isNotExpired = subscriptionData.subscriptionEndDate ? new Date(subscriptionData.subscriptionEndDate) > new Date() : false;
            
            token.hasActiveSubscription = isActive && isNotExpired;
            token.subscriptionTier = subscriptionData.subscriptionTier;
            token.subscriptionLastChecked = Date.now();
            
            console.log('Server runtime: updated token subscription data', { 
              status: subscriptionData.subscriptionStatus,
              hasActive: token.hasActiveSubscription,
              tier: token.subscriptionTier 
            });
          }
        } else {
          // No subscription data found
          token.hasActiveSubscription = false;
        }
      }

      return token;
    },
    async session({ session, token }: { session: any, token: JWT }) {
      // Debug session issues
      console.log('Session callback triggered', { hasToken: !!token });

      if (token) {
        // Ensure all necessary user properties are properly set
        session.user = {
          ...session.user,
          id: Number(token.id),
          role: token.role as Role,
          hasActiveSubscription: token.hasActiveSubscription || false,
          subscriptionTier: token.subscriptionTier || null,
          email: token.email || '',
          name: token.name || null
        };
        
        console.log('Session populated with user role:', token.role);
      } else {
        console.log('Warning: No token available in session callback');
      }

      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      // Redirect to the appropriate URL based on the user's role
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};

// Create NextAuth handler with proper config type
export const { handlers, auth, signIn, signOut } = NextAuth(config as any);

// Export auth handler for use in API routes and server components
export { auth as getServerSession };
export { auth as getServerAuthSession };
