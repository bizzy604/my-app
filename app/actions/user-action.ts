'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

export type ProfileUpdateData = {
  name?: string
  email?: string
  company?: string
  phone?: string
  businessType?: string
  registrationNumber?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  website?: string
  employeeCount?: string
  establishmentDate?: string
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function updateUserProfile(userId: string, data: ProfileUpdateData) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Convert string ID to number since our schema uses integer
  const id = parseInt(userId)

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
        phone: data.phone,
        // Only include optional fields if they are provided
        ...(data.businessType && { businessType: data.businessType }),
        ...(data.registrationNumber && { registrationNumber: data.registrationNumber }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.country && { country: data.country }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.website && { website: data.website }),
        ...(data.employeeCount && { employeeCount: data.employeeCount }),
        ...(data.establishmentDate && { establishmentDate: new Date(data.establishmentDate) }),
      },
    })

    // Revalidate both profile pages since the user might be either type
    revalidatePath('/vendor/profile')
    revalidatePath('/procurement-officer/profile')
    
    return user
  } catch (error) {
    console.error('Error updating profile:', error)
    throw new Error('Failed to update profile')
  }
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const hashedPassword = await hash(data.password, 10)
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  })
  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}