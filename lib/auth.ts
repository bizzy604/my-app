// Import required dependencies for NextAuth v5
import { NextAuthOptions, getServerSession as getNextAuthServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma'
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

// Helper function to fetch subscription data
async function getUserSubscriptionData(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionTier: true,
        updatedAt: true
      }
    });
    return user;
  } catch (error) {
    console.error(`Error fetching subscription data for user ${userId}:`, error);
    return null;
  }
}

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

// Define auth configuration for NextAuth v5
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === 'production', // Enable secure in production
        domain: process.env.NODE_ENV === 'production' ? '.innobid.net' : undefined // Add domain in production
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SignIn callback:', { 
        hasUser: !!user,
        userId: user?.id,
        accountType: account?.type
      });
      return true;
    },
    async jwt({ token, user, trigger }) {
      console.log('JWT Callback - Input:', { 
        hasUser: !!user, 
        userId: user?.id || token?.id,
        userRole: user?.role || token?.role,
        trigger,
        tokenId: token?.id
      });

      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.userUpdatedAt = user.updatedAt?.getTime() || Date.now();
        
        // Add subscription status to token for procurement officers
        if (user.role === 'PROCUREMENT') {
          token.hasActiveSubscription = user.subscriptionStatus === 'active';
          token.subscriptionTier = user.subscriptionTier;
        }

        console.log('JWT Token Created:', {
          id: token.id,
          role: token.role,
          hasActiveSubscription: token.hasActiveSubscription
        });
      }

      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Input:', { 
        hasToken: !!token, 
        tokenId: token?.id,
        tokenRole: token?.role 
      });

      if (token) {
        session.user = {
          ...session.user,
          id: Number(token.id),
          role: token.role as Role,
          hasActiveSubscription: token.hasActiveSubscription || false,
          subscriptionTier: token.subscriptionTier || null,
          email: token.email || '',
          name: token.name || null
        };

        console.log('Session Created:', {
          id: session.user.id,
          role: session.user.role,
          hasActiveSubscription: session.user.hasActiveSubscription
        });
      }
      return session;
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
          console.log('Missing credentials');
          return null;
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
        });

        if (!user) {
          console.log('User not found:', credentials.email);
          return null;
        }

        if (!user.emailVerified) {
          console.log('Email not verified:', credentials.email);
          throw new Error('Email not verified');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          console.log('Invalid password for user:', credentials.email);
          return null;
        }

        console.log('User authorized:', {
          id: user.id,
          email: user.email,
          role: user.role
        });

        return user;
      }
    })
  ]
};

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
