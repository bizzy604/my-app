// Import required dependencies for NextAuth v4
import { NextAuthOptions, getServerSession as getNextAuthServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '@/lib/prisma'
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

// Extend default session types
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name?: string | null;
      role: Role;
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
    }
  }

  interface User {
    id: number;
    email: string;
    name?: string | null;
    role: Role;
    subscriptionStatus?: string | null;
    subscriptionTier?: string | null;
    updatedAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: Role;
    id?: number;
    hasActiveSubscription?: boolean;
    subscriptionTier?: string | null;
    subscriptionLastChecked?: number;
    userUpdatedAt?: number; // Timestamp of when the user record was last updated in the database
  }
}

// Define auth configuration for NextAuth v4
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Configure URLs for different environments
  // The URL for URLs sent in emails will use NEXTAUTH_URL from env
  // but NextAuth will still work correctly on localhost during development
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // In production use secure cookies, in development allow non-secure
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // If this is a sign-in event
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
        token.userUpdatedAt = user.updatedAt?.getTime() || Date.now();
        
        // Add timestamp of when we last checked subscription
        token.subscriptionLastChecked = Date.now();
        
        // Add subscription status to token
        if (user.role === 'PROCUREMENT') {
          try {
            const userWithSubscription = await prisma.user.findUnique({
              where: { id: Number(user.id) },
              select: { 
                subscriptionStatus: true,
                subscriptionTier: true
              }
            });
            
            // Add subscription data to token
            token.hasActiveSubscription = userWithSubscription?.subscriptionStatus === 'active';
            token.subscriptionTier = userWithSubscription?.subscriptionTier;
            
            console.log('JWT updated with subscription data:', {
              userId: user.id,
              hasActiveSubscription: token.hasActiveSubscription,
              subscriptionTier: token.subscriptionTier
            });
          } catch (error) {
            console.error('Error fetching subscription data for token:', error);
            token.hasActiveSubscription = false;
          }
        }
      }
      
      // Always refresh subscription status for procurement officers on any token update
      if (token.role === 'PROCUREMENT' && token.id) {
        try {
          // Check if the user record has been updated since we last loaded the token
          // This ensures we always have fresh subscription data after Stripe webhooks
          const dbUser = await prisma.user.findUnique({
            where: { id: Number(token.id) },
            select: { 
              updatedAt: true,
              subscriptionStatus: true,
              subscriptionTier: true
            }
          });
          
          if (dbUser) {
            const dbUserUpdatedAt = dbUser.updatedAt?.getTime() || 0;
            const tokenUserUpdatedAt = token.userUpdatedAt || 0;
            
            // If the database user record was updated after our token was generated
            // or we haven't checked subscription in 5 minutes, refresh the token data
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            const needsRefresh = dbUserUpdatedAt > tokenUserUpdatedAt || 
              !token.subscriptionLastChecked || 
              token.subscriptionLastChecked < fiveMinutesAgo;
              
            if (needsRefresh) {
              // Update token with fresh subscription data
              token.hasActiveSubscription = dbUser.subscriptionStatus === 'active';
              token.subscriptionTier = dbUser.subscriptionTier;
              token.subscriptionLastChecked = Date.now();
              token.userUpdatedAt = dbUserUpdatedAt;
              
              console.log('JWT automatically refreshed with subscription data:', {
                userId: token.id,
                hasActiveSubscription: token.hasActiveSubscription,
                subscriptionTier: token.subscriptionTier,
                refreshReason: dbUserUpdatedAt > tokenUserUpdatedAt ? 'User updated' : 'Time elapsed'
              });
            }
          }
        } catch (error) {
          console.error('Error refreshing subscription data for token:', error);
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id)
        session.user.role = token.role as Role
        
        // Add subscription status to session
        session.user.hasActiveSubscription = token.hasActiveSubscription;
        session.user.subscriptionTier = token.subscriptionTier;
      }
      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            emailVerified: true,
            subscriptionStatus: true,
            subscriptionTier: true,
            updatedAt: true
          }
        })

        if (!user) {
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Return a user object that matches the NextAuth User type
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionTier: user.subscriptionTier,
          updatedAt: user.updatedAt
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  }
}

// Create a helper function to get session on server
export async function getServerAuthSession() {
  const session = await getNextAuthServerSession(authOptions);
  
  // Set RLS context based on the session user
  if (session?.user?.id) {
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
      if (session.user.role) {
        await prisma.$executeRaw`SELECT set_config('app.user_role', ${session.user.role}, true)`;
      }
    } catch (error) {
      console.error('Error setting RLS context in auth session:', error);
    }
  }
  
  return session;
}
