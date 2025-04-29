import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

/**
 * Direct redirect API that performs a server-side redirect to bypass NextAuth's client-side redirection
 * This avoids issues with the login?callbackUrl parameter
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const path = formData.get('path') as string;
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    // Create a fully-qualified URL for the redirect
    // Use the host from the request to ensure we're redirecting to the same domain
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'innobid.net';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}${path}`;
    
    console.log(`Redirecting to: ${redirectUrl}`);
    
    // Perform a 303 See Other redirect, which is appropriate for redirecting after POST
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error('Error performing direct redirect:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
