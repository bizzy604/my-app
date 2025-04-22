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
  
  // Update user subscription details
  await prisma.user.updateMany({
    where: {
      stripeCustomerId: customerId
    },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionTier: tier,
      // Convert Unix timestamp to JavaScript Date
      subscriptionEndDate: new Date(subscription.current_period_end * 1000)
    }
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, customerId: string) {
  await prisma.user.updateMany({
    where: {
      stripeCustomerId: customerId
    },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionEndDate: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now())
    }
  });
}
