import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

/**
 * Direct redirect API that performs a server-side redirect based on user role
 * Works with NextAuth v5 to properly handle authentication state
 */
export async function GET(req: NextRequest) {
  console.log('------- DIRECT-REDIRECT API GET REQUEST -------');
  try {
    // Get auth session using NextAuth v5 pattern
    const session = await getServerAuthSession();
    console.log('Session in direct-redirect:', session ? {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role
    } : 'No session found');
    
    if (!session || !session.user) {
      console.log('No authenticated session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Determine redirect path based on role
    let redirectPath = '/';
    const role = session.user.role?.toLowerCase();
    
    if (role) {
      console.log(`User has role: ${role}`);
      switch(role) {
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
      console.log('User has no role in session, checking database');
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true }
        });
        
        if (user?.role) {
          const dbRole = user.role.toLowerCase();
          console.log(`Found role in database: ${dbRole}`);
          
          switch(dbRole) {
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
        console.error('Error fetching user role from database:', error);
      }
    }
    
    console.log(`Redirecting authenticated user to: ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  } catch (error) {
    console.error('Error in direct-redirect GET handler:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export async function POST(req: NextRequest) {
  console.log('------- DIRECT-REDIRECT API POST REQUEST -------');
  try {
    const formData = await req.formData();
    const path = formData.get('path') as string;
    
    if (!path) {
      console.log('No path provided in request');
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    console.log(`Redirecting to path from POST request: ${path}`);
    
    // Create a fully-qualified URL for the redirect
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}${path}`;
    
    console.log(`Full redirect URL: ${redirectUrl}`);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error('Error in direct-redirect POST handler:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
