import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiToken } from './api-auth';

// Type for API route handlers that require authentication
export type SecureApiHandler = (
  req: NextRequest,
  token: ApiToken,
  context?: any
) => Promise<NextResponse>;

// Middleware factory to secure API routes
export function createSecureHandler(handler: SecureApiHandler) {
  return async (req: NextRequest, context?: any) => {
    return withApiAuth(req, (request, token) => handler(request, token, context));
  };
}

// Helper to check subscription tier for premium features
export async function checkSubscriptionTier(
  token: ApiToken,
  requiredTier: 'standard' | 'ai'
): Promise<boolean> {
  try {
    // If tier is standard, all users with active subscription can access
    if (requiredTier === 'standard') {
      // In a real implementation, you would check the database for active subscription
      return true;
    }
    
    // If tier is ai, only users with AI subscription can access
    if (requiredTier === 'ai') {
      // For now, we'll just check if the user role is PROCUREMENT
      // In production, you should check the actual subscription tier
      return token.role === 'PROCUREMENT';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking subscription tier:', error);
    return false;
  }
}
