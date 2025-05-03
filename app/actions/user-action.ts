'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { User, BusinessType } from '@prisma/client'
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

  // Process businessType if present to convert from string to enum
  const businessTypeValue = data.businessType ? 
    (Object.values(BusinessType).includes(data.businessType as BusinessType) ? 
      data.businessType as BusinessType : undefined) : 
    undefined;
  
  // Convert establishment date string to Date object if present
  const establishmentDate = data.establishmentDate ? new Date(data.establishmentDate) : undefined;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
        phone: data.phone,
        // Only include optional fields if they are provided
        ...(businessTypeValue && { businessType: businessTypeValue }),
        ...(data.registrationNumber && { registrationNumber: data.registrationNumber }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.country && { country: data.country }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.website && { website: data.website }),
        ...(data.employeeCount && { employeeCount: data.employeeCount }),
        ...(establishmentDate && { establishmentDate }),
      },
    })

    revalidatePath('/account')
    revalidatePath('/dashboard')
    return user
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const hashedPassword = await hash(data.password, 10)
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      settings: data.settings || undefined,
    },
  })
  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}