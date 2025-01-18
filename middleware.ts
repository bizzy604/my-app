import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Define role-specific paths
    const vendorPaths = ['/vendor', '/vendor/tenders', '/vendor/awarded-tenders', '/vendor/report', '/vendor/statistics', '/vendor/help', '/vendor/settings', '/vendor/notifications', '/vendor/feedback']
    const citizenPaths = ['/citizen', '/citizen/tenders', '/citizen/awarded-tenders', '/citizen/report', '/citizen/statistics', '/citizen/help', '/citizen/settings', '/citizen/notifications', '/citizen/feedback']
    const procurementPaths = ['/procurement-officer', '/procurement-officer/tenders', '/procurement-officer/tenders-history', '/procurement-officer/help', '/procurement-officer/resource-center', '/procurement-officer/settings', '/procurement-officer/notifications', '/procurement-officer/feedback']

    // Check if user is accessing paths they shouldn't
    if (token?.role === "vendor" && !vendorPaths.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/vendor", req.url))
    }

    if (token?.role === "citizen" && !citizenPaths.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/citizen", req.url))
    }

    if (token?.role === "procurement" && !procurementPaths.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/procurement-officer", req.url))
    }
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

