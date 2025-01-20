import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            throw new Error("Email and password are required")
          }

          // Normalize email to lowercase
          const normalizedEmail = credentials.email.toLowerCase()
          console.log("Attempting to authorize user with email:", normalizedEmail)

          // Fetch user from the database
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })

          console.log("Found user:", user)

          if (!user) {
            console.log("User not found")
            throw new Error("User not found")
          }

          // Compare the hashed password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log("Password valid:", isValid)

          if (!isValid) {
            console.log("Invalid password")
            throw new Error("Invalid password")
          }

          // Return user object without password
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.role = token.role
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }