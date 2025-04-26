import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";


// Export the NextAuth v4 API handler with proper App Router exports
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
