import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

/**
 * This API route handles redirects from Stripe payment success
 * It detects whether we're in development or production and redirects accordingly
 * Now also directly updates subscription status to ensure autonomous operation
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
  const sessionId = searchParams.get('session_id'); // Get session ID if available
  
  console.log(`Requested redirect path: ${redirectPath}, Session ID: ${sessionId || 'Not provided'}`);
  
  // Determine the base URL based on the environment - always use the actual host
  const protocol = isLocalhost ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  try {
    // Get the current auth session to identify the user
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    
    if (session?.user?.id) {
      console.log(`Found authenticated user with ID: ${session.user.id}`);
      
      // Directly update the user's subscription status in the database
      const { prisma } = await import('@/lib/prisma');
      
      // Find the current user subscription status
      const currentUser = await prisma.user.findUnique({
        where: { id: Number(session.user.id) },
        select: {
          id: true,
          email: true,
          subscriptionStatus: true,
          subscriptionTier: true
        }
      });
      
      console.log(`Current subscription status: ${currentUser?.subscriptionStatus || 'unknown'}`);
      
      // Force-update the subscription status to active
      // This ensures the user can access the dashboard immediately
      if (currentUser) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now
        
        const updatedUser = await prisma.user.update({
          where: { id: currentUser.id },
          data: {
            subscriptionStatus: 'active',
            subscriptionTier: currentUser.subscriptionTier || 'standard',
            subscriptionEndDate: endDate,
            updatedAt: new Date() // Force update timestamp to trigger token refresh
          }
        });
        
        console.log(`Subscription status updated: ${updatedUser.subscriptionStatus}`);
      }
    }
  } catch (error) {
    console.error('Error updating subscription in payment success handler:', error);
  }
  
  // Add a timestamp parameter to force a new session
  // This bypasses caching and ensures the middleware sees fresh data
  const refreshUrl = new URL('/api/refresh-session', baseUrl);
  refreshUrl.searchParams.set('redirect', redirectPath);
  refreshUrl.searchParams.set('t', Date.now().toString()); // Add timestamp to bust cache
  
  console.log(`Redirecting to: ${refreshUrl.toString()}`);
  console.log('------- PAYMENT SUCCESS HANDLER COMPLETED -------');
  
  // Redirect to the refresh-session endpoint with the appropriate base URL
  return NextResponse.redirect(refreshUrl.toString());
}
