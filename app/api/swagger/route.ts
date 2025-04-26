export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { getApiDocs } from '@/lib/swagger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Check for authenticated user
  const session = await getServerAuthSession();
  
  // Only allow authenticated users to access the API docs
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized access' }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
    });
  }
  
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate API docs' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
    });
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
