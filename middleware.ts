// middleware.ts
import { NextResponse } from "next/server";
import { UserRole } from "./lib/roles";
import { withAuth } from "next-auth/middleware";

// Configuration for auth-protected routes only
export const config = {
  matcher: [
    // ONLY protect these specific paths
    '/procurement-officer/:path*',
    '/vendor/:path*',
    '/citizen/:path*',
    '/pricing'
  ]
};

// Define middleware function - NextAuth v5 pattern
export default withAuth(
  function middleware(req) {
    
    const token = req.nextauth?.token;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check role-based access
    const path = req.nextUrl.pathname;
    const role = token.role as UserRole;

    // Subscription check for procurement officers
    if (path.startsWith('/procurement-officer')) {
      if (role !== 'PROCUREMENT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      // Check subscription status for procurement officers
      if (!token.hasActiveSubscription) {
        return NextResponse.redirect(new URL('/pricing', req.url));
      }
    }

    if (path.startsWith('/vendor') && role !== 'VENDOR') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (path.startsWith('/citizen') && role !== 'CITIZEN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      }
    }
  }
);