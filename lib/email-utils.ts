import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Ensure environment variables are loaded
if (!process.env.MAILERSEND_API_KEY) {
  throw new Error('MAILERSEND_API_KEY is not defined in the environment variables')
}

// Initialize MailerSend with your API key
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

// Add a logging utility
function logEmailEvent(type: 'sent' | 'failed', email: string, context?: any) {
  console.log(JSON.stringify({
    type: `email_${type}`,
    email,
    timestamp: new Date().toISOString(),
    context
  }));
}

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


// RESETTING PASSWORD TEMPLATE
export async function sendPasswordResetEmail(email: string, token: string) {
  // Change reset link to point to set-new-password page
  const resetLink = `${process.env.NEXTAUTH_URL}/set-new-password?token=${token}`

  const sentFrom = new Sender(
    "noreply@trial-k68zxl2kmeklj905.mlsender.net", 
    "Innobid"
  );

  const recipients = [
    new Recipient(email)
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Password Reset Request")
    .setHtml(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #4B0082; text-align: center; margin-bottom: 20px;">Password Reset</h1>
          
          <p style="color: #333; line-height: 1.6;">Hello, </p>
          
          <p style="color: #333; line-height: 1.6;">
            You have requested to reset your password for your Innobid account. 
            Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${resetLink}" 
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
              Set New Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 0.9em; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${resetLink}
          </p>
          
          <p style="color: #666; font-size: 0.9em; margin-top: 20px; text-align: center;">
            This link will expire in 1 hour. If you didn't request this reset, 
            please ignore this email.
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; text-align: center;">
            <p style="color: #999; font-size: 0.8em;">
              ${new Date().getFullYear()} Innobid. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `)
    .setText(`Reset your Innobid account password: ${resetLink}`);

  try {
    const response = await mailerSend.email.send(emailParams);
    logEmailEvent('sent', email, { type: 'password_reset', response });
    console.log('Password reset email sent successfully', response);
    return true;
  } catch (error) {
    // Log the full error for debugging
    console.error('Detailed MailerSend Error:', JSON.stringify(error, null, 2));
    
    logEmailEvent('failed', email, { 
      type: 'password_reset', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
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


// EMAIL VERIFICATION TEMPLATE
export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const sentFrom = new Sender(
    "noreply@trial-k68zxl2kmeklj905.mlsender.net", 
    "Innobid"
  );

  const recipients = [
    new Recipient(email)
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Verify Your Innobid Account")
    .setHtml(`
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
    `)
    .setText(`Verify your Innobid account: ${verificationLink}`);

  try {
    const response = await mailerSend.email.send(emailParams);
    logEmailEvent('sent', email, { type: 'verification', response });
    return true;
  } catch (error) {
    // Log the full error for debugging
    console.error('Detailed MailerSend Error:', JSON.stringify(error, null, 2));
    
    logEmailEvent('failed', email, { 
      type: 'verification', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}