// Import type definitions for proper type checking
import { Session, DefaultSession } from "next-auth";
import { CustomPrismaAdapter } from "@/lib/auth-adapter";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";

// Enable debug mode if NEXTAUTH_DEBUG is set to true
const isDebugEnabled = process.env.NEXTAUTH_DEBUG === "true";

// Load the NEXTAUTH_SECRET from environment variables
const secretKey = process.env.NEXTAUTH_SECRET;

if (!secretKey) {
  console.error("NEXTAUTH_SECRET is not set in environment variables");
}

// Create NextAuth handler with improved logging and error handling
const handler = NextAuth({
  ...authOptions,
  debug: isDebugEnabled,
  
  // Override some settings for better debugging
  callbacks: {
    // Preserve original callbacks
    ...(authOptions.callbacks || {}),
    
    // Add better redirect handling
    async redirect({ url, baseUrl }) {
      if (isDebugEnabled) {
        console.log(`NextAuth redirect callback: url=${url}, baseUrl=${baseUrl}`);
      }
      
      // In production, make sure baseUrl is properly set from environment
      const productionUrl = process.env.NEXTAUTH_URL || baseUrl;
      const effectiveBaseUrl = process.env.NODE_ENV === 'production' ? productionUrl : baseUrl;
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        const fullUrl = `${effectiveBaseUrl}${url}`;
        if (isDebugEnabled) {
          console.log(`Redirecting to relative URL: ${fullUrl}`);
        }
        return fullUrl;
      }
      
      // Handle absolute URLs that match the baseUrl
      if (url.startsWith(effectiveBaseUrl)) {
        if (isDebugEnabled) {
          console.log(`Redirecting to same-origin URL: ${url}`);
        }
        return url;
      }
      
      // For safety, default to the baseUrl for any other URLs
      if (isDebugEnabled) {
        console.log(`Redirecting to baseUrl: ${effectiveBaseUrl}`);
      }
      return effectiveBaseUrl;
    },
    
    // Add JWT handling debug logging
    async jwt(params) {
      // First call the original JWT callback if it exists
      let token = params.token;
      
      if (authOptions.callbacks?.jwt) {
        token = await authOptions.callbacks.jwt(params);
      }
      
      if (isDebugEnabled) {
        const { token: origToken, user } = params;
        // Log details about token (but never log the full token for security)
        console.log('JWT callback processed:', { 
          hasUser: !!user,
          userId: user?.id || origToken?.id,
          userRole: user?.role || origToken?.role,
          tokenUpdated: !!token
        });
      }
      
      return token;
    },
    
    // Add session debug logging with proper type handling
    async session(params: {session: Session | DefaultSession, token: any}) {
      // First call the original session callback if it exists
      let session = params.session;
      
      if (authOptions.callbacks?.session) {
        try {
          // Use a complete type assertion to fix the type mismatch
          const customSession = await authOptions.callbacks.session(params as any);
          session = customSession as Session;
        } catch (error) {
          console.error('Error in session callback:', error);
        }
      }
      
      if (isDebugEnabled) {
        console.log('Session callback processed:', {
          userId: session?.user?.id,
          userRole: (session as any)?.user?.role,
          hasSession: !!session
        });
      }
      
      return session;
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