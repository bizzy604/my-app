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
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate API docs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
