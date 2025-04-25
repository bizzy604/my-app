import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the data from the request
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }
    
    console.log(`Activating subscription for checkout session: ${sessionId}`);
    
    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`Processing subscription activation for user: ${user.id} (${user.email})`);
    console.log(`Current subscription status: ${user.subscriptionStatus}`);

    // Get the session details from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items']
    });
    
    if (!checkoutSession || checkoutSession.status !== 'complete') {
      console.log(`Invalid checkout session status: ${checkoutSession?.status}`);
      return NextResponse.json(
        { error: 'Invalid or incomplete checkout session' },
        { status: 400 }
      );
    }
    
    // Get the subscription details
    const subscription = checkoutSession.subscription;
    
    if (!subscription || typeof subscription === 'string') {
      console.log('No subscription object found in checkout session');
      return NextResponse.json(
        { error: 'No subscription found in session' },
        { status: 400 }
      );
    }
    
    // Determine the subscription tier based on the price ID
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    
    // Check for AI tier based on price ID format (simplified example)
    const isAITier = priceId?.includes('AI') || priceId?.toLowerCase().includes('ai');
    const subscriptionTier = isAITier ? 'ai' : 'standard';
    
    console.log(`Determined subscription tier: ${subscriptionTier} (Price ID: ${priceId})`);
    
    // Force the subscription status to 'active' regardless of what Stripe reports
    const subscriptionStatus = 'active';
    
    // Update the user's subscription information with explicit values
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: typeof subscription === 'string' ? subscription : subscription.id,
        subscriptionStatus: subscriptionStatus,
        subscriptionTier: subscriptionTier,
        subscriptionEndDate: typeof subscription !== 'string' && (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
        // Update the stripeCustomerId if not already set
        stripeCustomerId: user.stripeCustomerId || (checkoutSession.customer as string),
        // Force update the timestamp to trigger JWT refresh
        updatedAt: new Date(),
      },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true,
        updatedAt: true
      }
    });
    
    console.log('Subscription successfully activated in database:', {
      userId: updatedUser.id,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionTier: updatedUser.subscriptionTier,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      updatedAt: updatedUser.updatedAt
    });
    
    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully',
      tier: subscriptionTier,
      status: subscriptionStatus,
      updatedUser: {
        id: updatedUser.id,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionTier: updatedUser.subscriptionTier
      }
    });
    
  } catch (error) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
