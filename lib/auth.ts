import NextAuth, { 
  AuthOptions, 
  Session, 
  User as NextAuthUser 
} from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma'
import bcrypt from "bcryptjs"
import { cookies } from 'next/headers'
import { decode } from "next-auth/jwt"
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
    id?: number;
    role?: Role;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number
        session.user.role = token.role as Role
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
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