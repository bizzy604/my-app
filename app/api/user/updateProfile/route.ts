import { NextResponse } from "next/server"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ProfileFormData {
    name?: string
    email?: string
    company?: string
    phone?: string
    registrationNumber?: string
    address?: string
    city?: string
    country?: string
    postalCode?: string
    businessType?: string
    establishmentDate?: string
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { id, profile } = data

        // Convert id from string to number
        const userId = parseInt(id, 10)
        console.log('Parsed userId:', userId)

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        // Inline user lookup
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Prepare the data object, ensuring dates are handled correctly
        const updateData: any = {
            ...profile,
            updatedAt: new Date(),
        }

        // If establishmentDate is provided, ensure it's a valid Date object
        if (profile.establishmentDate) {
            updateData.establishmentDate = new Date(profile.establishmentDate)
            console.log('Parsed establishmentDate:', updateData.establishmentDate)
        }

        console.log('Update Data:', updateData)

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
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