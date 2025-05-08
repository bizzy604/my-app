import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function checkSubscriptionAccess(
  requiredTier: 'standard' | 'ai' = 'standard'
) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return false;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      role: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      subscriptionEndDate: true
    }
  });
  
  // If no subscription is required or user is a procurement officer
  if (requiredTier === 'standard' && user?.role === 'PROCUREMENT') {
    return true;
  }
  
  // Check if user has an active subscription
  const hasActiveSubscription = 
    user?.subscriptionStatus === 'active' && 
    user?.subscriptionEndDate && 
    new Date(user.subscriptionEndDate) > new Date();
    
  // For AI tier, also check if the subscription tier is 'ai'
  if (requiredTier === 'ai') {
    return hasActiveSubscription && user?.subscriptionTier === 'ai';
  }
  
  // For standard tier, any active subscription is sufficient
  return hasActiveSubscription;
}

export function isFeatureAccessible(
  user: { 
    subscriptionTier?: string | null; 
    subscriptionStatus?: string | null;
    role?: string;
  },
  requiredTier: 'standard' | 'ai' = 'standard'
) {
  // If user is a procurement officer, they have access to standard features
  if (requiredTier === 'standard' && user.role === 'PROCUREMENT') {
    return true;
  }
  
  if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') {
    return false;
  }
  
  if (requiredTier === 'ai' && user.subscriptionTier !== 'ai') {
    return false;
  }
  
  return true;
}
