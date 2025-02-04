import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { Role } from "@prisma/client"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              name: true
            }
          })

          if (!user) {
            throw new Error('No user found with this email')
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication error')
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
        session.user.id = token.id?.toString() ?? ''
        session.user.role = token.role as Role
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }