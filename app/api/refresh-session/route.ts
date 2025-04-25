import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encode, decode } from 'next-auth/jwt';

// Secret used to encode/decode JWT tokens
const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: Request) {
  try {
    if (!secret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXTAUTH_SECRET not set' },
        { status: 500 }
      );
    }

    // Get the session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Decode the JWT token
    const token = await decode({
      token: sessionToken,
      secret
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Invalid token structure' },
        { status: 400 }
      );
    }

    // Get fresh user data from the database
    const user = await prisma.user.findUnique({
      where: { id: Number(token.id) },
      select: {
        id: true,
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the token with fresh subscription data
    const updatedToken = {
      ...token,
      hasActiveSubscription: user.subscriptionStatus === 'active',
      subscriptionTier: user.subscriptionTier,
      userUpdatedAt: user.updatedAt?.getTime() || Date.now(),
      subscriptionLastChecked: Date.now(),
    };

    console.log('Refreshing token with latest subscription data:', {
      userId: user.id,
      hasActiveSubscription: user.subscriptionStatus === 'active',
      subscriptionTier: user.subscriptionTier,
      forced: true
    });

    // Encode the updated token
    const newToken = await encode({
      token: updatedToken,
      secret
    });

    // Create a response with redirect
    const redirectUrl = new URL(req.url).searchParams.get('redirect') || '/procurement-officer?refreshed=true';
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    // Set the new cookie with the updated token
    response.cookies.set({
      name: 'next-auth.session-token',
      value: newToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
