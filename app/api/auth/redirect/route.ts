import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      role: user.role,
      id: user.id,
      hasActiveSubscription: user.subscriptionStatus === 'active',
      subscriptionTier: user.subscriptionTier
    });
  } catch (error) {
    console.error('Error determining redirect path:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}