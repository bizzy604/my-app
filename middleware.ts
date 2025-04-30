// middleware.ts
import { NextResponse } from "next/server";

// Disable authentication entirely in middleware to focus on debugging
// We'll directly pass all requests through
export function middleware() {
  console.log('------- DISABLED MIDDLEWARE - BYPASSING AUTH CHECKS -------');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Just bypass these paths without authentication
    '/procurement-officer/:path*',
    '/vendor/:path*',
    '/citizen/:path*',
    '/pricing'
  ]
};