export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { z } from 'zod';

// Define schema for request validation
const checkoutSchema = z.object({
  priceId: z.string().min(3).max(100)
});

export async function POST(req: Request) {
  try {
    // Initialize Stripe
    const stripe = getStripeClient();

    // Verify authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Validate CSRF token from headers
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = checkoutSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    const { priceId } = validationResult.data;
    
    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name
      });
      
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }
    
    // Validate price ID format before sending to Stripe
    if (!priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Invalid price ID format' },
        { status: 400 }
      );
    }
    
    // Get base URL from environment with no fallback
    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Create checkout session with validated parameters
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    // Log error without exposing details
    console.error('Stripe checkout error occurred');
    
    // Return generic error message
    return NextResponse.json(
      { error: 'Unable to process payment request' },
      { status: 500 }
    );
  }
}
