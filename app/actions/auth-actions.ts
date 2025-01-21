import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateEmailVerificationToken, sendVerificationEmail } from '@/lib/email-utils'

export async function CreateUser(
  name: string,
  email: string,
  password: string,
  role: 'PROCUREMENT' | 'VENDOR' | 'CITIZEN'
): Promise<User> {
  console.log("Creating user with:", { name, email, role })
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  })

  // Generate and send verification email
  const verificationToken = await generateEmailVerificationToken(email)
  await sendVerificationEmail(email, verificationToken)

  return user
}