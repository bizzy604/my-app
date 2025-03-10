import { NextRequest, NextResponse } from 'next/server'
import { manuallyVerifyEmail } from '@/lib/email-utils'

/**
 * API endpoint to manually verify a user's email for development purposes
 * This should be disabled or secured in production
 */
export async function POST(req: NextRequest) {
  // This endpoint should only be accessible in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'This endpoint is not available in production' }, { status: 403 })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const success = await manuallyVerifyEmail(email)

    if (success) {
      return NextResponse.json({ message: `User ${email} has been verified` })
    } else {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in manual verification endpoint:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 