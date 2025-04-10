// Import required dependencies - properly structured for NextAuth 5
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
    }
  }

  interface User {
    id: number;
    email: string;
    name?: string | null;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: Role;
    id?: number;
  }
}

// Define auth options that work with NextAuth 5
export const authOptions = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
      }
      // Ensure token doesn't expire too quickly
      token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id)
        session.user.role = token.role as Role
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
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
          id: user.id, // Use number type
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // For Next.js Pages API Routes - better compatibility with memory constraints
      }
    }
  }
})

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

export { handlers, auth, signIn, signOut };

// Create a helper function to get session on server
export async function getServerAuthSession() {
  // Use getServerSession with authOptions
  return await authOptions.getServerSession();
}
