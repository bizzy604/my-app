import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// This is a debugging endpoint to help diagnose token-related issues
export async function GET() {
  try {
    // Get the session which contains the token data
    const session = await getServerAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get fresh DB data for comparison
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true
      }
    });
    
    // Return both token data and database data for comparison
    return NextResponse.json({
      token: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        hasActiveSubscription: session.user.hasActiveSubscription,
        subscriptionTier: session.user.subscriptionTier,
      },
      database: user
    });
  } catch (error) {
    console.error('Error in token debug endpoint:', error);
    return NextResponse.json(
      { error: 'Error retrieving token data' },
      { status: 500 }
    );
  }
}
