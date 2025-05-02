// Import type definitions for proper type checking
import { Session, DefaultSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import { Role } from "@prisma/client";

// Enable debug mode if NEXTAUTH_DEBUG is set to true
const isDebugEnabled = process.env.NEXTAUTH_DEBUG === "true";

// Load the NEXTAUTH_SECRET from environment variables
const secretKey = process.env.NEXTAUTH_SECRET;

if (!secretKey) {
  console.error("NEXTAUTH_SECRET is not set in environment variables");
}

// Create NextAuth handler with debug logging
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }