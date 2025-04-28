import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";

// Export the NextAuth handler with proper App Router exports
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
