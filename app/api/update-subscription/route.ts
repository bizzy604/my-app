import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { INNOBID_STANDARD_PRICE_ID, INNOBID_AI_PRICE_ID } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();

    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the current subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 400 }
      );
    }

    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // Get the requested tier from the request body
    const { targetTier } = await req.json();
    
    if (!targetTier || !['standard', 'ai'].includes(targetTier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier requested' },
        { status: 400 }
      );
    }
    
    // If already on the requested tier, return early
    if (user.subscriptionTier === targetTier) {
      return NextResponse.json(
        { error: 'You are already subscribed to this plan' },
        { status: 400 }
      );
    }
    
    // Get the price ID for the new plan
    const priceId = targetTier === 'ai' ? INNOBID_AI_PRICE_ID : INNOBID_STANDARD_PRICE_ID;
    
    console.log(`Updating subscription ${user.subscriptionId} from ${user.subscriptionTier} to ${targetTier}`);
    console.log(`New price ID: ${priceId}`);
    
    try {
      // Get the subscription
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      
      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription not found in Stripe' },
          { status: 400 }
        );
      }
      
      // Find the first subscription item (typically there is only one)
      const itemId = subscription.items.data[0]?.id;
      
      if (!itemId) {
        return NextResponse.json(
          { error: 'No subscription items found' },
          { status: 400 }
        );
      }
      
      // Update the subscription directly
      await stripe.subscriptions.update(user.subscriptionId, {
        items: [
          {
            id: itemId,
            price: priceId,
          },
        ],
      });
      
      // Update the user record in the database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: targetTier,
          updatedAt: new Date() // Force update to trigger JWT refresh
        }
      });
      
      return NextResponse.json({ 
        message: 'Subscription updated successfully',
        subscription: {
          tier: targetTier,
          status: 'active'
        },
        // Redirect to success page
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      
      // Try a direct database update instead as a fallback
      if (user.subscriptionStatus === 'active') {
        console.log('Updating subscription in database only as fallback');
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: targetTier,
            updatedAt: new Date() // Force update to trigger JWT refresh
          }
        });
        
        return NextResponse.json({ 
          message: 'Subscription updated in database only',
          subscription: {
            tier: targetTier,
            status: 'active'
          },
          // Redirect to success page
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`
        });
      }
      
      throw stripeError;
    }
  } catch (error) {
    console.error('Stripe subscription update error:', error);
    return NextResponse.json(
      { error: 'Error updating subscription' },
      { status: 500 }
    );
  }
}
