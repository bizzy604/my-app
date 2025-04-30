import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth'; 
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

/**
 * Direct redirect API that performs a server-side redirect to bypass NextAuth's client-side redirection
 * This avoids issues with the login?callbackUrl parameter
 * 
 * Handles both GET requests (from NextAuth) and POST requests (direct from client)
 */
export async function GET(req: NextRequest) {
  try {
    // Get the auth session using the proper NextAuth v5 function
    const session = await getServerAuthSession();
    
    if (!session || !session.user) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    console.log('Session found in direct-redirect, user:', session.user.email);
    
    // Determine redirect path based on role
    let redirectPath = '/';
    
    if (session.user.role) {
      switch(session.user.role.toLowerCase()) {
        case 'procurement': 
          redirectPath = '/procurement-officer';
          break;
        case 'vendor': 
          redirectPath = '/vendor';
          break;
        case 'citizen': 
          redirectPath = '/citizen';
          break;
      }
    } else {
      // Fallback - try to get role from database
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email as string },
          select: { role: true }
        });
        
        if (user?.role) {
          switch(user.role.toLowerCase()) {
            case 'procurement': 
              redirectPath = '/procurement-officer';
              break;
            case 'vendor': 
              redirectPath = '/vendor';
              break;
            case 'citizen': 
              redirectPath = '/citizen';
              break;
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }
    
    // Create a fully-qualified URL for the redirect
    // Use the host from the request to ensure we're redirecting to the same domain
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}${redirectPath}`;
    
    console.log(`Redirecting to: ${redirectUrl}`);
    
    // Perform a redirect
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling GET redirect:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const path = formData.get('path') as string;
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    // Create a fully-qualified URL for the redirect
    // Use the host from the request to ensure we're redirecting to the same domain
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
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
