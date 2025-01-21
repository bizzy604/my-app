import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs"

export const authOptions = {
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
          where: { email: credentials.email as string }
        })

        if (!user) {
          return null
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordCorrect) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      if (token.role) {
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: "/login"
  }
}

export const auth = NextAuth(authOptions)

export const { signIn, signOut } = auth

// Extend default session types
declare module "next-auth" {
  interface Session {
    user: {
      city: string;
      country: string;
      postalCode: string;
      businessType: string;
      establishmentDate: string | number | Date;
      address: string;
      registrationNumber: string;
      phone: string;
      company: string;
      id: number
      email: string
      name?: string | null
      role: string
    }
  }
}
