// middleware.ts
import { NextResponse } from "next/server";
import { UserRole } from "./lib/roles";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";

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
  function middleware(req: NextRequestWithAuth) {
    console.log('------- MIDDLEWARE EXECUTION STARTED -------');
    console.log(`Middleware processing URL: ${req.url}`);
    console.log(`Pathname: ${req.nextUrl.pathname}`);
    
    const token = req.nextauth.token;
    
    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    console.log('Auth token received:', {
      name: token.name,
      email: token.email,
      role: token.role,
      hasActiveSubscription: token.hasActiveSubscription || false
    });
    
    // Subscription check only for procurement officers
    if (token.role === UserRole.PROCUREMENT && 
        req.nextUrl.pathname.startsWith('/procurement-officer') && 
        !token.hasActiveSubscription) {
      console.log('Procurement officer without subscription, redirecting to pricing');
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
    
    console.log('User is authenticated and authorized, proceeding to protected route');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Middleware authorization check:', token ? 'Has token' : 'No token');
        return !!token;
      }
    },
    pages: {
      signIn: '/login',
      signOut: '/login',
      error: '/login'
    }
  }
);