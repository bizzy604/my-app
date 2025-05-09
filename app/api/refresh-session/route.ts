export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encode, decode } from 'next-auth/jwt';
import { getServerAuthSession } from '@/lib/auth';

// Secret used to encode/decode JWT tokens
const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  console.log('------- REFRESH SESSION API CALLED -------');
  
  try {
    if (!secret) {
      console.error('NEXTAUTH_SECRET not set');
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXTAUTH_SECRET not set' },
        { status: 500 }
      );
    }

    // Get redirect URL from query params
    const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/procurement-officer';
    console.log(`Requested redirect URL: ${redirectUrl}`);
    
    // First try to get the session using NextAuth v5's getServerAuthSession
    const session = await getServerAuthSession();
    console.log('Session from getServerAuthSession:', session ? 'Found' : 'Not found');
    
    if (session && session.user) {
      // We have a valid session, use it to get the user ID
      const userId = session.user.id;
      console.log('User ID from session:', userId);
      
      // Get fresh user data from the database
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          role: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          updatedAt: true
        }
      });
      
      if (!user) {
        console.error('User not found for ID:', userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log('User found:', {
        id: user.id,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier
      });
      
      // Create an updated token with fresh subscription data
      // In newer Next.js, cookies() returns a Promise
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('next-auth.session-token')?.value;
      
      if (sessionToken) {
        // Try to decode the token
        try {
          // NextAuth v5 approach: Instead of manipulating the token directly,
          // let's use a more reliable approach to force a complete session refresh
          console.log('Using enhanced approach for session refresh with latest subscription data');
          
          // Double-check subscription status before redirecting
          if (user && user.subscriptionStatus === 'active') {
            console.log('User has ACTIVE subscription status - ensure dashboard access');
            // Use special URL parameter for middleware to recognize active subscription
            const targetUrl = new URL(redirectUrl, req.nextUrl.origin);
            targetUrl.searchParams.set('subscription_active', 'true');
            targetUrl.searchParams.set('session_refreshed', Date.now().toString());
            console.log(`Redirecting to dashboard with active status: ${targetUrl.toString()}`);
            console.log('------- REFRESH SESSION COMPLETED WITH ACTIVE SUBSCRIPTION -------');
            return NextResponse.redirect(targetUrl.toString());
          } else {
            // Standard redirect for normal flow
            console.log('Standard redirect for session refresh');
            // Add timestamp to force fresh session and bypass cache
            const targetUrl = new URL(redirectUrl, req.nextUrl.origin);
            targetUrl.searchParams.set('t', Date.now().toString());
            console.log(`Redirecting to: ${targetUrl.toString()}`);
            console.log('------- REFRESH SESSION COMPLETED WITH REDIRECT -------');
            return NextResponse.redirect(targetUrl.toString());
          }
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
        }
      }
    }
    
    // Fallback: If we couldn't get the session or update the token,
    // redirect to login with the original redirect as a callback
    console.log('No valid session found, redirecting to login');
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', redirectUrl);
    
    console.log(`Redirecting to login: ${loginUrl.toString()}`);
    console.log('------- REFRESH SESSION REDIRECTING TO LOGIN -------');
    
    return NextResponse.redirect(loginUrl.toString());
    
  } catch (error) {
    console.error('Error in refresh-session API:', error);
    console.log('------- REFRESH SESSION FAILED -------');
    
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
