export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe'; // Changed import

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient(); // Call the function here

    const session = await getServerAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true
      }
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    // Get the request host header for proper URL detection
    const host = req.headers.get('host') || '';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') 
      ? 'http' 
      : 'https';
    
    // Construct base URL using the host header to ensure it works both locally and in production
    const baseUrl = `${protocol}://${host}`;

    // Create a Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/procurement-officer`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe customer portal error:', error);
    return NextResponse.json(
      { error: 'Error creating customer portal session' },
      { status: 500 }
    );
  }
}
