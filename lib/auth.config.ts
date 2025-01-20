import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs"

export const authConfig = {
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
    /**
     * Update the session with the user's role from the JWT.
     *
     * @param {object} session - The session object
     * @param {object} token - The JWT object
     * @return {object} The updated session object
     */
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.role = token.role
      }
      return session
    },
    /**
     * Add the user's role to the JWT.
     *
     * @param {object} param0 - An object with the token and user
     * @param {object} param0.token - The JWT object
     * @param {object} param0.user - The user object
     * @return {object} The JWT with the role added
     */
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: "/login"
  }
}

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth(authConfig)
