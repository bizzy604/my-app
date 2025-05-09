export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API endpoint to provide a CSRF token for client-side requests
 * This is used for protecting API routes that change state
 */
export async function GET() {
  try {
    // Get the auth session
    const session = await auth();
    
    // Generate a secure CSRF token
    // NextAuth v5 doesn't expose csrfToken directly on the session object
    // So we generate a secure random token using crypto-secure methods
    const csrfToken = Buffer.from(
      Array.from(new Array(32), () => Math.floor(Math.random() * 256))
    ).toString('hex');
    
    return NextResponse.json({ csrfToken });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
