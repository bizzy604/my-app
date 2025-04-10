import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "./lib/roles"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Define role-specific paths
    const rolePathMap = {
      [UserRole.VENDOR]: ['/vendor', '/vendor/tenders', '/vendor/awarded-tenders', '/vendor/report', '/vendor/statistics', '/vendor/help', '/vendor/settings', '/vendor/notifications', '/vendor/feedback'],
      [UserRole.CITIZEN]: ['/citizen', '/citizen/tenders', '/citizen/awarded-tenders', '/citizen/report', '/citizen/statistics', '/citizen/help', '/citizen/settings', '/citizen/notifications', '/citizen/feedback'],
      [UserRole.PROCUREMENT]: ['/procurement-officer', '/procurement-officer/tenders', '/procurement-officer/tenders-history', '/procurement-officer/help', '/procurement-officer/resource-center', '/procurement-officer/settings', '/procurement-officer/notifications', '/procurement-officer/feedback']
    }

    // Check if user is accessing paths they shouldn't
    const userRole = token?.role as UserRole
    const allowedPaths = rolePathMap[userRole] || []
    
    // Check if the current path is allowed for user's role
    const basePathSegments = path.split('/')
    const basePath = '/' + (basePathSegments[1] || '')
    
    // If user is trying to access a path that's not allowed for their role
    if (!allowedPaths.includes(basePath) && basePathSegments[1] !== '') {
      // Redirect to home or dashboard based on role
      const homePath = userRole ? (rolePathMap[userRole][0] || '/') : '/'
      return NextResponse.redirect(new URL(homePath, req.url))
    }
    
    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Protect these paths
export const config = {
  matcher: [
    '/procurement-officer/:path*',
    '/vendor/:path*',
    '/citizen/:path*',
  ]
}
