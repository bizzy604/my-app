import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
export const dynamic = "force-dynamic";

// Import rate limiting utility
interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>;
}

// Inline implementation of rate limiting to avoid import issues
function rateLimit(options: RateLimitOptions): RateLimiter {
  const { interval, uniqueTokenPerInterval } = options;
  const tokenCache = new Map<string, number[]>();
  
  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [];
        const currentTime = Date.now();
        const timeWindow = currentTime - interval;
        
        // Filter out tokens older than the current interval
        const filteredTokens = tokenCount.filter((timestamp) => timestamp > timeWindow);
        
        // Check if we've exceeded the limit
        if (filteredTokens.length >= limit) {
          reject(new Error('Rate limit exceeded'));
          return;
        }
        
        // Add the current request timestamp
        filteredTokens.push(currentTime);
        
        // Update the token cache
        tokenCache.set(token, filteredTokens);
        
        // Clean up old tokens periodically
        if (tokenCache.size > uniqueTokenPerInterval) {
          const entries = Array.from(tokenCache.entries());
          const oldestToken = entries.sort((a, b) => {
            return Math.min(...a[1]) - Math.min(...b[1]);
          })[0][0];
          
          tokenCache.delete(oldestToken);
        }
        
        resolve();
      }),
  };
}

// Define schema for request validation
const redirectSchema = z.object({
  email: z.string().email().min(5).max(100)
});

// Create a rate limiter for this endpoint (10 requests per minute)
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max 100 users per interval
});

export async function POST(req: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    // Apply rate limiting
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    // Validate CSRF token
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    // Verify CSRF token matches
    const expectedToken = process.env.NEXT_PUBLIC_CSRF_TOKEN;
    if (expectedToken && csrfToken !== expectedToken) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = redirectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    const { email } = validationResult.data;

    // Query database for user
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
    
    const response = {
      role: user.role,
      id: user.id,
      hasActiveSubscription: user.subscriptionStatus === 'active',
      subscriptionTier: user.subscriptionTier
    };
    
    return NextResponse.json(response);
  } catch (error) {
    // Log error without sensitive details
    console.error('Redirect API error occurred');
    
    // Return generic error message
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}