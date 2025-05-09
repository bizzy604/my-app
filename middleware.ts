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
export default auth((req: NextRequest) => {
  // In NextAuth v5, the auth property is added to the req object by the auth middleware
  // but TypeScript doesn't know this, so we need to use type assertion
  const auth = (req as any).auth;
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
      
      // Check for special parameter from payment success flow
      const hasForceAccessParam = req.nextUrl.searchParams.get('subscription_active') === 'true';
      const hasSessionRefreshed = req.nextUrl.searchParams.has('session_refreshed');
      
      // Allow bypass if coming from payment success and refresh session
      if (hasForceAccessParam && hasSessionRefreshed) {
        console.log('Payment success detected - allowing access despite subscription check');
        // Remove these parameters and redirect to the clean URL
        const cleanUrl = new URL(req.nextUrl.pathname, req.url);
        return NextResponse.redirect(cleanUrl.toString());
      }
      
      // Check subscription status for procurement officers
      if (!auth.user.hasActiveSubscription) {
        // Add additional check in database to verify subscription status
        // This double-check ensures we have the most up-to-date data
        const { headers } = req;
        console.log('Procurement officer without active subscription in token, double-checking database');
        
        // Use the pathname to determine if we should redirect
        const bypassCheck = pathname.includes('/payment-success') || 
                         pathname.includes('/subscription/success') || 
                         pathname.includes('/pricing');
        
        if (!bypassCheck) {
          console.log('Redirecting to pricing page for subscription');
          return NextResponse.redirect(new URL('/pricing', req.url));
        }
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