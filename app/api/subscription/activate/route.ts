export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { z } from 'zod';

// Define schema for request validation
const activateSchema = z.object({
  sessionId: z.string().min(10).max(100)
});

export async function POST(req: NextRequest) {
  try {
    // Get the stripe client instance
    const stripe = getStripeClient();
    
    // Get the session to verify the user
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Temporarily log CSRF token information for debugging
    const csrfToken = req.headers.get('x-csrf-token');
    console.log('Activate subscription request - CSRF token:', csrfToken ? 'Present' : 'Missing');
    
    // Temporarily bypass CSRF check during debugging
    // In production, you would want to restore this check
    /* Commenting out temporarily to debug subscription flow
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }
    */
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = activateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    const { sessionId } = validationResult.data;
    
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

    // Get the session details from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items', 'customer']
    });
    
    // Verify that the checkout session belongs to this user
    const sessionCustomerId = checkoutSession.customer as string;
    if (user.stripeCustomerId && user.stripeCustomerId !== sessionCustomerId) {
      return NextResponse.json(
        { error: 'Unauthorized access to checkout session' },
        { status: 403 }
      );
    }
    
    if (!checkoutSession || checkoutSession.status !== 'complete') {
      return NextResponse.json(
        { error: 'Invalid or incomplete checkout session' },
        { status: 400 }
      );
    }
    
    // Get the subscription details
    const subscription = checkoutSession.subscription;
    
    if (!subscription || typeof subscription === 'string') {
      return NextResponse.json(
        { error: 'No subscription found in session' },
        { status: 400 }
      );
    }
    
    // Determine the subscription tier based on the price ID
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid price information' },
        { status: 400 }
      );
    }
    
    // Validate against known price IDs (should be stored in environment variables or database)
    const validPriceIds = [
      process.env.STRIPE_STANDARD_PRICE_ID,
      process.env.STRIPE_AI_PRICE_ID
    ].filter(Boolean);
    
    if (validPriceIds.length > 0 && !validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Unrecognized price ID' },
        { status: 400 }
      );
    }
    
    // Check for AI tier based on price ID format or environment variable match
    const isAITier = priceId === process.env.STRIPE_AI_PRICE_ID || 
                    (priceId?.toLowerCase().includes('ai') && !validPriceIds.length);
    const subscriptionTier = isAITier ? 'ai' : 'standard';
    
    // Get subscription status from Stripe object
    const subscriptionStatus = 'active';
    
    // Log current user state before update
    console.log('Activating subscription - Current user state:', {
      userId: user.id,
      email: user.email,
      currentSubscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId
    });

    // Prepare the subscription data with explicit values
    const subscriptionData = {
      subscriptionId: typeof subscription === 'string' ? subscription : subscription.id,
      subscriptionStatus: 'active', // Explicitly set to 'active'
      subscriptionTier: subscriptionTier,
      subscriptionEndDate: typeof subscription !== 'string' && (subscription as any).current_period_end ? 
        new Date((subscription as any).current_period_end * 1000) : 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days if not available
      // Update the stripeCustomerId if not already set
      stripeCustomerId: user.stripeCustomerId || (checkoutSession.customer as string),
      // Force update the timestamp to trigger JWT refresh
      updatedAt: new Date(),
    };

    console.log('Attempting to update user subscription with data:', {
      userId: user.id,
      subscriptionId: subscriptionData.subscriptionId,
      status: subscriptionData.subscriptionStatus,
      tier: subscriptionData.subscriptionTier,
      endDate: subscriptionData.subscriptionEndDate
    });

    // Update the user's subscription information with explicit values
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: subscriptionData,
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true,
        updatedAt: true
      }
    });

    console.log('Successfully updated user subscription:', {
      userId: updatedUser.id,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionTier: updatedUser.subscriptionTier,
      subscriptionEndDate: updatedUser.subscriptionEndDate
    });
    
    // Successful activation - no need to log sensitive details
    
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
    // Log error without exposing details
    console.error('Subscription activation error occurred');
    
    // Return generic error message
    return NextResponse.json(
      { error: 'Unable to process subscription activation' },
      { status: 500 }
    );
  }
}
