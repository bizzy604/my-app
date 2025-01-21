import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

// Ensure environment variables are loaded
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in the environment variables')
}

// Initialize Resend with your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function generateEmailVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken: token,
      emailVerificationTokenExpiry: expiryTime
    }
  })

  return token
}

export async function verifyEmail(token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { 
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { gt: new Date() }
    }
  })

  if (!user) return false

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null
    }
  })

  return true
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: 'noreply@innobid.com',
      to: email,
      subject: 'Verify Your Innobid Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4B0082; text-align: center; margin-bottom: 20px;">Verify Your Email</h1>
            
            <p style="color: #333; line-height: 1.6;">Hello, </p>
            
            <p style="color: #333; line-height: 1.6;">
              Thank you for registering with Innobid. To complete your registration and activate your account, 
              please click the verification button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a 
                href="${verificationLink}" 
                style="
                  display: inline-block; 
                  background-color: #4B0082; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  font-weight: bold;
                "
              >
                Verify Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 0.9em; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${verificationLink}
            </p>
            
            <p style="color: #666; font-size: 0.9em; margin-top: 20px; text-align: center;">
              This link will expire in 24 hours. If you didn't create an account, 
              please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; text-align: center;">
              <p style="color: #999; font-size: 0.8em;">
                ${new Date().getFullYear()} Innobid. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `Verify your Innobid account: ${verificationLink}`
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpiry: expiryTime
    }
  })

  return token
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { 
      passwordResetToken: token,
      passwordResetTokenExpiry: { gt: new Date() }
    }
  })

  if (!user) return false

  // Hash the new password (assuming you're using bcrypt)
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null
    }
  })

  return true
}
