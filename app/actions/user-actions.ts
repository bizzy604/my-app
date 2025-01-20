import { prisma } from '@/lib/prisma' // Ensure correct import path

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
  establishmentDate?: Date
}

export async function updateUserProfile(id: string, data: ProfileFormData) {
  try {
    // Convert id from string to number
    const userId = parseInt(id, 10)
    console.log('Parsed userId:', userId) // Debugging

    if (isNaN(userId)) {
      throw new Error('Invalid user ID')
    }

    // Prepare the data object, ensuring dates are handled correctly
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // If establishmentDate is provided, ensure it's a valid Date object
    if (data.establishmentDate) {
      updateData.establishmentDate = new Date(data.establishmentDate)
    }

    console.log('Update Data:', updateData) 

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })
    return updatedUser
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }
}