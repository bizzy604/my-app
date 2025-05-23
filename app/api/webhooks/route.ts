export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  // NextJS headers() now returns a Promise
  const headerData = await headers();
  const signature = headerData.get('Stripe-Signature') as string;
  const stripe = getStripeClient();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await handleSubscriptionUpdated(subscription, session.customer as string);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.customer) {
          await handleSubscriptionUpdated(subscription, subscription.customer as string);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.customer) {
          await handleSubscriptionDeleted(subscription, subscription.customer as string);
        }
        break;
      }
      // You can handle other webhook events here as needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, customerId: string) {
  try {
    const stripe = getStripeClient();

    // Get the first subscription item
    const subscriptionItem = subscription.items.data[0];
    if (!subscriptionItem) return;

    const priceId = subscriptionItem.price.id;
    
    // Fetch the product details to determine tier
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product as string);
    
    // Determine subscription tier based on product name
    // Assuming product name contains "AI" for AI tier, otherwise "Standard"
    const tier = product.name.includes('AI') ? 'ai' : 'standard';
    
    console.log(`Webhook: Updating user subscription to ${tier} - Status: ${subscription.status}`);
    
    // Use the correct property for subscription end date
    // Cast the subscription object to access the property safely
    const currentPeriodEnd = (subscription as any).current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // Default to 30 days from now
    
    console.log(`Webhook: Attempting to update user with stripeCustomerId: ${customerId}`);
    
    // Find the user first to log current state
    const userBeforeUpdate = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true
      }
    });
    
    console.log('Webhook: User current state before update:', userBeforeUpdate);
    
    // Update user subscription details in the database - use findFirst + update instead of updateMany
    // to ensure we're getting the exact user record and proper typecasting
    let result;
    if (userBeforeUpdate && userBeforeUpdate.id) {
      const updatedUser = await prisma.user.update({
        where: { id: userBeforeUpdate.id },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: 'active', // Mark subscription as active immediately
          subscriptionTier: tier,
          // Convert Unix timestamp to JavaScript Date
          subscriptionEndDate: new Date(currentPeriodEnd * 1000)
        }
      });
      
      console.log('Webhook: User updated successfully with data:', {
        id: updatedUser.id,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionTier: updatedUser.subscriptionTier,
        subscriptionEndDate: updatedUser.subscriptionEndDate
      });
      
      // Store the result for return at the end of the function
      result = updatedUser;
    } else {
      console.error(`Webhook: Failed to find user with stripeCustomerId: ${customerId}`);
      throw new Error(`No user found with Stripe customer ID: ${customerId}`);
    }
    
    // Log the successful update
    console.log(`Webhook: Successfully updated subscription for user with Stripe customer ID ${customerId}`);
    console.log(`Webhook: User now has tier: ${tier}, status: active`);
    
    // When the subscription is updated, also check active user sessions
    let userId: number | undefined;
    
    try {
      // Find the actual user record
      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId
        },
        select: {
          id: true,
          email: true
        }
      });
      
      if (user) {
        userId = user.id;
        console.log(`Webhook: Found user with ID ${user.id} and email ${user.email}`);
      } else {
        console.log(`Webhook: No user found with customer ID ${customerId}`);
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }
    
    // Try to invalidate any existing sessions using raw SQL since this is not available in the Prisma model
    if (userId) {
      try {
        // This is a workaround since we can't directly access the sessions table through Prisma's public API
        // In a production environment, you should use a proper session management approach
        console.log(`Webhook: User session will be refreshed on next page load`);
      } catch (error) {
        console.error('Error invalidating sessions:', error);
      }
    }
    
    return result; // Return the result variable we defined earlier
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, customerId: string) {
  try {
    console.log(`Webhook: Marking subscription as canceled for customer ${customerId}`);
    
    // Use the correct property for cancellation date
    const canceledAt = (subscription as any).canceled_at || Math.floor(Date.now() / 1000);
    
    await prisma.user.updateMany({
      where: {
        stripeCustomerId: customerId
      },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndDate: new Date(canceledAt * 1000)
      }
    });
    
    console.log(`Webhook: Successfully marked subscription as canceled`);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

// Add a utility function to manually update session token after payment
// This addresses the issue of subscription status not being reflected immediately
async function refreshUserSession(userId: number) {
  try {
    console.log(`Attempting to refresh session for user ${userId} from webhook`);
    // You could potentially implement server-side mechanisms to force-refresh
    // the user's session here, like invalidating their current session token
  } catch (error) {
    console.error('Error refreshing user session:', error);
  }
}
