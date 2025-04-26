export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { createSecureHandler } from "@/lib/api-middleware"
import { ApiToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export const GET = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    // Token is already validated by middleware, we can use token.userId directly
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        city: true,
        country: true,
        postalCode: true,
        businessType: true,
        establishmentDate: true,
        address: true,
        registrationNumber: true,
        phone: true,
        company: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        // Don't include password or other sensitive fields
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: "Failed to fetch user" }, 
      { status: 500 }
    )
  }
})
