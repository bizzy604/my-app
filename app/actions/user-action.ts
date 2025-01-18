'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function updateUserProfile(id: number, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id },
    data,
  })
  revalidatePath('/profile')
  return user
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