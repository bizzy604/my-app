import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

export async function CreateUser(
  name: string,
  email: string,
  hashedPassword: string,
  role: 'PROCUREMENT' | 'VENDOR' | 'CITIZEN'
): Promise<User> {
  console.log("Creating user with:", { name, email, role })
  
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  })
}