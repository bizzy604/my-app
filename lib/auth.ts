import NextAuth, { 
  AuthOptions, 
  Session, 
  User as NextAuthUser, 
  Account, 
  Profile
} from "next-auth"
import AdapterUser from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs"
import { cookies } from 'next/headers'
import { decode } from "next-auth/jwt"
import { Role } from "@prisma/client"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Ensure token doesn't expire too quickly
      token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id?.toString() ?? ''
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
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  }
}

// Custom server-side session handling
export async function getServerSession() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  const sessionToken = cookieStore.get('next-auth.session-token')?.value

  if (!sessionToken) {
    console.error('getServerSession - No session token found')
    return null
  }

  try {
    // Decode the JWT token
    const decodedToken = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!decodedToken) {
      console.error('getServerSession - Token could not be decoded')
      return null
    }

    // Find the user based on the decoded token
    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(decodedToken.sub as string, 10) 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return user ? {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    } : null
  } catch (error) {
    console.error('Server session error:', error)
    return null
  }
}

export const auth = NextAuth(authOptions)

export const { signIn, signOut } = auth
