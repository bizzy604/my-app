import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateEmailVerificationToken, sendVerificationEmail } from '@/lib/email-utils'
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ 
        message: 'Password must be at least 8 characters long.' 
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User with this email already exists.' 
      }, { status: 400 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with email unverified
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        emailVerified: false
      }
    })

    // Generate email verification token
    const verificationToken = await generateEmailVerificationToken(normalizedEmail)

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationToken)

    // Return success with verification pending status
    return NextResponse.json({ 
      message: 'Registration successful. Please check your email to verify your account.',
      verificationPending: true,
      userId: user.id 
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json({ 
      message: 'Registration failed. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}