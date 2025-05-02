import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

/**
 * This API route handles redirects from Stripe payment success
 * It detects whether we're in development or production and redirects accordingly
 */
export async function GET(req: NextRequest) {
  console.log('------- PAYMENT SUCCESS REDIRECT HANDLER -------');
  
  // Get the current host/origin
  const host = req.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  
  console.log(`Current host: ${host}, isLocalhost: ${isLocalhost}`);
  
  // Get any query parameters to preserve them
  const searchParams = req.nextUrl.searchParams;
  const redirectPath = searchParams.get('redirect') || '/procurement-officer';
  
  console.log(`Requested redirect path: ${redirectPath}`);
  
  // Determine the base URL based on the environment
  const baseUrl = isLocalhost 
    ? `http://${host}`
    : process.env.NEXTAUTH_URL || 'https://innobid.net';
  
  // Construct the refresh-session URL
  const refreshUrl = new URL('/api/refresh-session', baseUrl);
  refreshUrl.searchParams.set('redirect', redirectPath);
  
  console.log(`Redirecting to: ${refreshUrl.toString()}`);
  console.log('------- PAYMENT SUCCESS HANDLER COMPLETED -------');
  
  // Redirect to the refresh-session endpoint with the appropriate base URL
  return NextResponse.redirect(refreshUrl.toString());
}
