import { NextRequest, NextResponse } from 'next/server';
import { createSecureHandler } from '@/lib/api-middleware';
import { checkSubscriptionTier } from '@/lib/api-middleware';
export const dynamic = "force-dynamic";
import { ApiToken } from '@/lib/api-auth';

// This is a secure API endpoint that requires a valid API token
export const GET = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    // Example: Check if user has permission to access this resource
    // You could check for specific roles or subscription tiers
    const hasAccess = token.role === 'ADMIN' || token.role === 'PROCUREMENT';
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Permission denied', message: 'You do not have access to this resource' },
        { status: 403 }
      );
    }
    
    // Example: Return data to the authorized user
    return NextResponse.json({
      message: 'Secure API endpoint accessed successfully',
      user: {
        userId: token.userId,
        email: token.email,
        role: token.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in secure endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Example of a POST endpoint that requires premium subscription
export const POST = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    // First check if user has the required subscription tier (AI tier)
    const hasRequiredTier = await checkSubscriptionTier(token, 'ai');
    
    if (!hasRequiredTier) {
      return NextResponse.json(
        { 
          error: 'Subscription required',
          message: 'This endpoint requires an AI subscription tier'
        },
        { status: 403 }
      );
    }
    
    // Process the request body
    const body = await req.json();
    
    // Return response
    return NextResponse.json({
      message: 'Premium API feature accessed successfully',
      data: body,
      processed: true,
      userId: token.userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in premium endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});
