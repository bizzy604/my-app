import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"

// For NextAuth 4.22.1 with App Router
const handler = NextAuth(authOptions)

// Export the GET and POST handlers
export { handler as GET, handler as POST }
