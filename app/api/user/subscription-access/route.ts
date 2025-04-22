import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { checkSubscriptionAccess } from '@/lib/subscription';

// This endpoint checks if the current user has access to a specific subscription tier
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { hasAccess: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the requested tier from query parameters
    const url = new URL(req.url);
    const tier = url.searchParams.get('tier') as 'standard' | 'ai' || 'standard';

    // Check if user has access to the requested tier
    const hasAccess = await checkSubscriptionAccess(tier);

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return NextResponse.json(
      { hasAccess: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Set dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';
