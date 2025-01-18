import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { hash, compare } from "bcryptjs"
import { users } from "@/lib/db"
import { NextAuthOptions } from "next-auth"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            throw new Error("Email and password required")
          }

          const user = users.find(user => user.email === credentials.email)
          console.log("Found user:", user)
          
          if (!user) {
            console.log("User not found")
            throw new Error("User not found")
          }

          // For testing - hash the stored plain password first
          if (!user.password.startsWith('$2')) {
            user.password = await hash(user.password, 10)
          }

          // Debug password comparison
          console.log("Comparing passwords:")
          console.log("Input password:", credentials.password)
          console.log("Stored hash:", user.password)
          
          const isValid = await compare(credentials.password, user.password)
          console.log("Password valid:", isValid)

          if (!isValid) {
            console.log("Invalid password")
            throw new Error("Invalid password")
          }

          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }