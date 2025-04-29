// middleware.ts
import { NextResponse } from "next/server";
import { UserRole } from "./lib/roles";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;
    
    // CRITICAL: If we have a callbackUrl in the URL, remove it completely
    if (searchParams.has('callbackUrl')) {
      const url = new URL(req.url);
      url.searchParams.delete('callbackUrl');
      return NextResponse.redirect(url);
    }
    
    // Only handle subscription requirements for authenticated users
    const token = req.nextauth.token;
    if (token?.role === UserRole.PROCUREMENT && 
        !pathname.startsWith('/pricing') && 
        !token.hasActiveSubscription &&
        !searchParams.get('subscribed')) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // Simple auth check - token required for protected routes
        return !!token;
      }
    }
  }
);

// Only protect these specific paths
export const config = {
  matcher: [
    '/procurement-officer/:path*',
    '/vendor/:path*',
    '/citizen/:path*',
    '/pricing',
  ]
};