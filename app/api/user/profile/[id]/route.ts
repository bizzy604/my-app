import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params

    // Convert id from string to number
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    try {
        // Fetch the user profile from the database
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!userProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(userProfile, { status: 200 })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}