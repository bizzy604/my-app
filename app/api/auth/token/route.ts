import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user and generate token
    const auth = await authenticateApiUser(email, password);
    
    // Check if authentication succeeded
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Return the token
    return NextResponse.json({
      token: auth.token,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        role: auth.user.role
      },
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
