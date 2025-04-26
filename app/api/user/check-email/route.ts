import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        message: 'Email is required' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        message: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
