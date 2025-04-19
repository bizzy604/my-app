import { NextResponse } from "next/server"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

interface ProfileFormData {
    name?: string
    email?: string
    company?: string
    phone?: string
    registrationNumber?: string
    address?: string
    website?: string
    city?: string
    country?: string
    postalCode?: string
    businessType?: string
    establishmentDate?: string
}

export async function POST(request: NextRequest) {
    try {
        // Get the session to verify the user
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let data
        try {
            data = await request.json()
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
        }

        const { id, profile } = data

        if (!id || !profile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify that the logged-in user matches the requested update
        if (session.user.id !== id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Convert id from string to number if needed
        const userId = typeof id === 'string' ? parseInt(id, 10) : id

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        // Check if the email already exists for another user
        const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
        })

        if (existingUser && existingUser.id !== userId) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                registrationNumber: profile.registrationNumber,
                address: profile.address,
                website: profile.website,
                city: profile.city,
                country: profile.country,
                postalCode: profile.postalCode,
                businessType: profile.businessType,
                establishmentDate: profile.establishmentDate ? new Date(profile.establishmentDate) : undefined,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'An unexpected error occurred' 
        }, { status: 500 })
    }
}

// Explicitly set dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'
