import { NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const internalApiKey = req.headers.get('x-internal-api-key');
    
    // Check if this is an internal middleware request with userId
    if (userId && internalApiKey === (process.env.INTERNAL_API_KEY || 'innobid-internal')) {
      // This is a trusted internal request - serve subscription data directly
      console.log('Internal API call for subscription data, userId:', userId);
      
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          updatedAt: true
        }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user);
    }
    
    // Normal frontend request - use session
    const session = await getServerAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user subscription information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate days remaining in subscription if there's an end date
    let daysRemaining = null;
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return NextResponse.json({
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      daysRemaining
    });
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription data' },
      { status: 500 }
    );
  }
}
