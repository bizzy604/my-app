'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from 'bcryptjs'
import { sendPasswordResetEmail } from "@/lib/email-utils"

interface UserSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  bidUpdates: boolean
  tenderAlerts: boolean
  marketingEmails: boolean
  twoFactorAuth: boolean
}

interface ProfileData {
  name: string
  email: string
  company: string
  phone: string
  registrationNumber: string
  address: string
  city: string
  country: string
  postalCode: string
  businessType: string
  establishmentDate: string | Date | null
  website: string
}

export async function updateUserSettings(userId: string, settings: UserSettings) {
  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        settings: settings
      }
    })

    revalidatePath('/vendor/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating user settings:', error)
    throw new Error('Failed to update settings')
  }
}

export async function updateUserProfile(userId: string, profileData: ProfileData) {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: profileData.name,
        company: profileData.company,
        phone: profileData.phone,
        registrationNumber: profileData.registrationNumber,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        postalCode: profileData.postalCode,
        businessType: profileData.businessType as any,
        establishmentDate: profileData.establishmentDate ? (profileData.establishmentDate instanceof Date ? profileData.establishmentDate : new Date(profileData.establishmentDate)) : null,
        website: profileData.website
      }
    })

    revalidatePath('/vendor/profile')
    return { success: true, user }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('No account found with this email')
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = await bcrypt.hash(resetToken, 10)

    // Save token to database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
      }
    })

    // Send reset email
    await sendPasswordResetEmail(email, resetToken)

    return { success: true }
  } catch (error) {
    console.error('Error requesting password reset:', error)
    throw error
  }
}