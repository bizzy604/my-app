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
    console.log('------- MIDDLEWARE EXECUTION STARTED -------');
    console.log(`Middleware processing URL: ${req.url}`);
    console.log(`Pathname: ${req.nextUrl.pathname}`);
    
    const token = req.nextauth?.token;
    
    if (!token) {
      console.log('Middleware authorization check: No token');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('Auth token received:', {
      userId: token.id,
      role: token.role,
      hasActiveSubscription: token.hasActiveSubscription || false
    });

    // Check role-based access
    const path = req.nextUrl.pathname;
    const role = token.role as UserRole;

    // Subscription check for procurement officers
    if (path.startsWith('/procurement-officer')) {
      if (role !== 'PROCUREMENT') {
        console.log('Access denied: Not a procurement officer');
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      // Check subscription status for procurement officers
      if (!token.hasActiveSubscription) {
        console.log('Procurement officer without subscription, redirecting to pricing');
        return NextResponse.redirect(new URL('/pricing', req.url));
      }
    }

    if (path.startsWith('/vendor') && role !== 'VENDOR') {
      console.log('Access denied: Not a vendor');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (path.startsWith('/citizen') && role !== 'CITIZEN') {
      console.log('Access denied: Not a citizen');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log('Access granted for path:', path);
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