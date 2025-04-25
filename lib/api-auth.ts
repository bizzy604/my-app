import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Secret keys for JWT tokens
const API_SECRET_KEY = process.env.API_SECRET_KEY || 'innobid-api-secret-key-change-in-production';
const TOKEN_EXPIRATION = '24h';

// Define API token types
export interface ApiToken {
  userId: number;
  email: string;
  role: string;
  exp: number;
}

// Generate an API token
export async function generateApiToken(userId: number, email: string, role: string): Promise<string> {
  // Create token payload
  const payload: Omit<ApiToken, 'exp'> = {
    userId,
    email,
    role
  };
  
  // Generate JWT token
  return jwt.sign(payload, API_SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
}

// Verify an API token
export async function verifyApiToken(token: string): Promise<ApiToken | null> {
  try {
    // Verify the token
    const decoded = jwt.verify(token, API_SECRET_KEY) as ApiToken;
    return decoded;
  } catch (error) {
    console.error('API token verification failed:', error);
    return null;
  }
}

// Authenticate a user with username and password to get an API token
export async function authenticateApiUser(email: string, password: string): Promise<{ token: string, user: any } | null> {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      }
    });

    // Check if user exists
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Generate token
    const token = await generateApiToken(user.id, user.email, user.role);
    
    // Return token and user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('API authentication failed:', error);
    return null;
  }
}

// Middleware to check API token in requests
export async function withApiAuth(
  req: NextRequest,
  handler: (req: NextRequest, token: ApiToken) => Promise<NextResponse>
): Promise<NextResponse> {
  // Get authorization header
  const authHeader = req.headers.get('authorization');
  
  // Check if authorization header exists and has the right format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Extract the token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify the token
  const decoded = await verifyApiToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  
  // Call the handler with the token
  return handler(req, decoded);
}

// Rate limiting based on user ID to prevent abuse
const rateLimits = new Map<number, { count: number, resetTime: number }>();

export function checkRateLimit(userId: number, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  // If no rate limit entry or reset time has passed
  if (!userLimit || userLimit.resetTime < now) {
    rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // If under the limit
  if (userLimit.count < limit) {
    userLimit.count += 1;
    return true;
  }
  
  // Rate limit exceeded
  return false;
}
