import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log('------- REDIRECT API CALLED -------');
  try {
    const body = await req.json();
    const { email } = body;
    console.log(`Redirect API called with email: ${email}`);

    if (!email) {
      console.log('Redirect API error: Email is required');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Querying database for user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        role: true,
        id: true,
        subscriptionStatus: true,
        subscriptionTier: true
      }
    });

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`User found: ID=${user.id}, Role=${user.role}, SubscriptionStatus=${user.subscriptionStatus}, SubscriptionTier=${user.subscriptionTier}`);
    
    const response = {
      role: user.role,
      id: user.id,
      hasActiveSubscription: user.subscriptionStatus === 'active',
      subscriptionTier: user.subscriptionTier
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    console.log('------- REDIRECT API COMPLETED -------');
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in redirect API:', error);
    console.log('------- REDIRECT API FAILED -------');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}