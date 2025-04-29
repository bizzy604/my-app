import { CustomPrismaAdapter } from "@/lib/auth-adapter";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";

// Enable debug mode if NEXTAUTH_DEBUG is set to true
const isDebugEnabled = process.env.NEXTAUTH_DEBUG === "true";

// Load the AUTH_SECRET or NEXTAUTH_SECRET from environment variables
const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!secretKey) {
  console.error("AUTH_SECRET or NEXTAUTH_SECRET is not set in environment variables");
}

// Create NextAuth handler with improved logging and error handling
const handler = NextAuth({
  ...authOptions,
  debug: isDebugEnabled,
  
  // Override some settings for better debugging
  callbacks: {
    ...authOptions.callbacks,
    
    // Add better redirect handling
    async redirect({ url, baseUrl }) {
      if (isDebugEnabled) {
        console.log(`NextAuth redirect callback: url=${url}, baseUrl=${baseUrl}`);
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        if (isDebugEnabled) {
          console.log(`Redirecting to relative URL: ${fullUrl}`);
        }
        return fullUrl;
      }
      
      // Handle absolute URLs that match the baseUrl
      if (url.startsWith(baseUrl)) {
        if (isDebugEnabled) {
          console.log(`Redirecting to same-origin URL: ${url}`);
        }
        return url;
      }
      
      // For safety, default to the baseUrl for any other URLs
      if (isDebugEnabled) {
        console.log(`Redirecting to baseUrl: ${baseUrl}`);
      }
      return baseUrl;
    }
  },
  
  // Ensure consistent settings with our adapter and JWT settings
  adapter: CustomPrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Required for NextAuth v5
  secret: secretKey,
});

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };