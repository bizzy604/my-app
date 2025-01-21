import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmailVerificationToken, sendVerificationEmail } from '@/lib/email-utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ 
        message: 'Email is required' 
      }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    })

    if (!user) {
      return NextResponse.json({ 
        message: 'No account found with this email address' 
      }, { status: 404 })
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        message: 'Email is already verified' 
      }, { status: 400 })
    }

    // Generate new verification token
    const token = await generateEmailVerificationToken(normalizedEmail)

    // Send verification email
    await sendVerificationEmail(normalizedEmail, token)

    return NextResponse.json({ 
      message: 'Verification email sent successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Resend verification error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json({ 
      message: 'Failed to resend verification email. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
