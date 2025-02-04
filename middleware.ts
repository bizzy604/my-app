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
