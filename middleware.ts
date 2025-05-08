// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/roles";
import { auth } from "@/lib/auth";
import { cookies } from 'next/headers';

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
// Define auth middleware with proper types for NextAuth v5
export default auth((req) => {
  const { auth } = req;
  const { pathname } = req.nextUrl;
  
  console.log('Middleware session check:', {
    path: pathname,
    isAuthenticated: !!auth,
    hasToken: !!auth?.user,
    role: auth?.user?.role,
    hasActiveSubscription: auth?.user?.hasActiveSubscription
  });
  
  // Not authenticated  
  if (!auth?.user) {
    console.log('No authenticated user found, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

    // Check role-based access
    const role = auth.user.role as UserRole;

    // Subscription check for procurement officers
    if (pathname.startsWith('/procurement-officer')) {
      if (role !== 'PROCUREMENT') {
        console.log('User is not a PROCUREMENT officer, redirecting to unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      // Check subscription status for procurement officers
      if (!auth.user.hasActiveSubscription) {
        console.log('Procurement officer without active subscription, redirecting to pricing');
        return NextResponse.redirect(new URL('/pricing', req.url));
      }
    }

    if (pathname.startsWith('/vendor') && role !== 'VENDOR') {
      console.log('User is not a VENDOR, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/citizen') && role !== 'CITIZEN') {
      console.log('User is not a CITIZEN, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    console.log('User authorized to access:', pathname);
    return NextResponse.next();

});