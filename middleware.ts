import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "./lib/roles"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const searchParams = req.nextUrl.searchParams
    
    // Check for the special refresh parameter which indicates we've just subscribed
    const hasJustSubscribed = searchParams.get('subscribed') === 'true'
    
    // If user has just subscribed, always let them through to their dashboard
    // regardless of what the token says about subscription status
    if (hasJustSubscribed && path.startsWith('/procurement-officer')) {
      console.log('Bypassing subscription check due to recent subscription');
      
      // Keep the subscribed parameter for this request but remove it for future requests
      // by redirecting to the clean URL after this page load completes
      const newUrl = new URL(req.url)
      newUrl.searchParams.delete('subscribed')
      
      // Allow this request through, but set up a redirect for subsequent requests
      // This ensures the next page load will have a clean URL
      return NextResponse.next({
        headers: {
          'Set-Cookie': `redirect-after-load=${newUrl.pathname}; Path=/; Max-Age=5;`
        }
      });
    }

    // Define role-specific paths
    const rolePathMap = {
      [UserRole.VENDOR]: ['/vendor', '/vendor/tenders', '/vendor/awarded-tenders', '/vendor/report', '/vendor/statistics', '/vendor/help', '/vendor/settings', '/vendor/notifications', '/vendor/feedback'],
      [UserRole.CITIZEN]: ['/citizen', '/citizen/tenders', '/citizen/awarded-tenders', '/citizen/report', '/citizen/statistics', '/citizen/help', '/citizen/settings', '/citizen/notifications', '/citizen/feedback'],
      [UserRole.PROCUREMENT]: ['/procurement-officer', '/procurement-officer/tenders', '/procurement-officer/tenders-history', '/procurement-officer/help', '/procurement-officer/resource-center', '/procurement-officer/settings', '/procurement-officer/notifications', '/procurement-officer/feedback']
    }

    // Paths that are exempt from subscription check
    const exemptPaths = ['/pricing', '/subscription/success', '/api/create-checkout-session', '/api/subscription/activate', '/api/customer-portal', '/api/webhooks'];
    
    // Check if user is accessing paths they shouldn't
    const userRole = token?.role as UserRole
    const allowedPaths = rolePathMap[userRole] || []
    
    // Check if the current path is allowed for user's role
    const basePathSegments = path.split('/')
    const basePath = '/' + (basePathSegments[1] || '')
    
    // Special handling for procurement officers - redirect to pricing if no subscription
    if (userRole === UserRole.PROCUREMENT && 
        !exemptPaths.some(p => path.startsWith(p)) && 
        !token?.hasActiveSubscription &&
        !hasJustSubscribed) {
      console.log('Redirecting to pricing page due to missing subscription:', {
        userId: token?.id,
        hasActiveSubscription: token?.hasActiveSubscription,
        path: path
      });
      // If no active subscription, redirect to pricing page
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
    
    // If user is trying to access a path that's not allowed for their role
    if (!allowedPaths.includes(basePath) && basePathSegments[1] !== '' && !exemptPaths.some(p => path.startsWith(p))) {
      // Redirect to home or dashboard based on role
      const homePath = userRole ? (rolePathMap[userRole][0] || '/') : '/'
      return NextResponse.redirect(new URL(homePath, req.url))
    }
    
    // If this is a dashboard access with the subscribed=true parameter,
    // remove the parameter for clean URLs but still allow access
    if (hasJustSubscribed && path.startsWith('/procurement-officer')) {
      const newUrl = new URL(req.url)
      newUrl.searchParams.delete('subscribed')
      
      // For this specific case, make sure we also set a cookie to force
      // a session refresh on the client side when they reach the dashboard
      return NextResponse.redirect(newUrl, {
        headers: {
          'Set-Cookie': 'force-session-refresh=true; Path=/; Max-Age=5;'
        }
      });
    }
    
    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// Protect these paths
export const config = {
  matcher: [
    '/procurement-officer/:path*',
    '/vendor/:path*',
    '/citizen/:path*',
    '/pricing',
  ]
}
