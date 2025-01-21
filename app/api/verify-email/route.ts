import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/email-utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  try {
    const verified = await verifyEmail(token)

    if (verified) {
      return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
