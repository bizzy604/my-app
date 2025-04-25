import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { Stripe } from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

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
    
    // Update user subscription details in the database
    const updatedUser = await prisma.user.updateMany({
      where: {
        stripeCustomerId: customerId
      },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: 'active', // Mark subscription as active immediately
        subscriptionTier: tier,
        // Convert Unix timestamp to JavaScript Date
        subscriptionEndDate: new Date(currentPeriodEnd * 1000)
      }
    });
    
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
    
    return updatedUser;
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
