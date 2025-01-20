
import { NextResponse } from "next/server"
import { NextRequest} from 'next/server'
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
  
  export async function getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    })
  }
  
  export async function POST(request: NextRequest) {
    try {
      const data: { id: string; profile: ProfileFormData } = await request.json()
      const { id, profile } = data
  
      // Convert id from string to number
      const userId = parseInt(id, 10)
      console.log('Parsed userId:', userId)
  
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
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
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
  
      console.log('Updated user:', updatedUser)
      return NextResponse.json({ user: updatedUser }, { status: 200 })
    } catch (error: any) {
      console.error('Error updating user profile:', error)
  
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
  
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
    }
  }