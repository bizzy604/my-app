import { NextRequest, NextResponse } from 'next/server'
import { resetPassword, generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/email-utils'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate password reset token
    const token = await generatePasswordResetToken(email)

    // Send password reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }

    const success = await resetPassword(token, newPassword)

    if (success) {
      return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
