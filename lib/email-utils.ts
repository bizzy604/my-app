import 'dotenv/config';
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { emailTemplates } from './email-templates'
import { createAppUrl } from './app-url';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

export async function sendPasswordResetEmail(email: string, token: string, recipientName?: string) {
  const resetLink = createAppUrl(`/set-new-password?token=${token}`, true);

  try {
    const info = await transporter.sendMail({
      from: `"Innobid" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4B0082; text-align: center; margin-bottom: 20px;">Password Reset</h1>
            <p>Hello${recipientName ? `, ${recipientName}` : ''},</p>
            <p>You requested to reset your password. Click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4B0082; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Set New Password
              </a>
            </div>
            <p>If the button doesn't work, paste this link: ${resetLink}</p>
          </div>
        </div>
      `,
      text: `Reset your Innobid account password: ${resetLink}`
    });
    logEmailEvent('sent', email, { type: 'password_reset', response: info });
    return true;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    logEmailEvent('failed', email, { 
      type: 'password_reset', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string, recipientName?: string) {
  const verificationLink = createAppUrl(`/verify-email?token=${token}`, true);

  try {
    const info = await transporter.sendMail({
      from: `"Innobid" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Innobid Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4B0082; text-align: center; margin-bottom: 20px;">Verify Your Email</h1>
            <p>Hello${recipientName ? `, ${recipientName}` : ''},</p>
            <p>Thank you for registering. Click below to verify:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #4B0082; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p>If it fails, use: ${verificationLink}</p>
          </div>
        </div>
      `,
      text: `Verify your Innobid account: ${verificationLink}`
    });
    logEmailEvent('sent', email, { type: 'verification', response: info });
    return true;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    logEmailEvent('failed', email, { 
      type: 'verification', 
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

interface EmailNotification {
  to: string
  subject: string
  ticketId?: string
  tenderId?: string
  status?: string
}

export async function sendSupportNotificationEmail({ to, subject, ticketId }: EmailNotification) {
  try {
    const info = await transporter.sendMail({
      from: `"Innobid Support" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Support Ticket Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Support Ticket Update</h2>
          <p>Your support ticket (ID: ${ticketId}) has been updated.</p>
          <p>Please log in to your account to view the details.</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${createAppUrl(`/support-tickets/${ticketId}`, true)}" style="background-color: #4B0082; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Ticket
            </a>
          </div>
        </div>
      `,
      text: `Your support ticket (ID: ${ticketId}) has been updated. Please log in to your account to view the details.`
    });
    logEmailEvent('sent', to, { type: 'support', response: info });
    return true;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    logEmailEvent('failed', to, { 
      type: 'support', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}

interface EmailData {
  recipientName: string
  tenderTitle: string
  message: string
  bidAmount: number
  companyName: string
  tenderReference: string
  evaluationScore?: number
  evaluationComments?: string
  nextSteps?: string
}

export async function sendTenderAwardEmail({ to, subject, data }: { to: string; subject: string; data: EmailData }) {
  try {
    const emailContent = `
      Dear ${data.recipientName},

      ${data.message}

      Tender Details:
      Reference: ${data.tenderReference}
      Title: ${data.tenderTitle}
      Bid Amount: ${data.bidAmount}
      Company: ${data.companyName}

      Please log in to the system to view more details and proceed with the necessary documentation.

      Best regards,
      Procurement Team
    `;

    const info = await transporter.sendMail({
      from: `"Innobid Notifications" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Tender Award Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Tender Award Notification</h2>
          <p>Dear ${data.recipientName},</p>
          <p>${data.message}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <h3 style="margin-top: 0;">Tender Details:</h3>
            <p><strong>Reference:</strong> ${data.tenderReference}</p>
            <p><strong>Title:</strong> ${data.tenderTitle}</p>
            <p><strong>Bid Amount:</strong> ${data.bidAmount}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
          </div>
          <p>Please log in to the system to view more details and proceed with the necessary documentation.</p>
          <p>Best regards,<br>Procurement Team</p>
        </div>
      `,
      text: emailContent
    });
    logEmailEvent('sent', to, { type: 'award', response: info });
    return true;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    logEmailEvent('failed', to, { type: 'award', error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
}

export async function sendBidStatusEmail(
  to: string,
  status: 'shortlisted' | 'evaluated' | 'awarded' | 'rejected',
  data: EmailData
) {
  try {
    const template = emailTemplates[status](data);
    const info = await transporter.sendMail({
      from: `"Innobid Notifications" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.subject
    });
    logEmailEvent('sent', to, { status, templateType: status, recipientName: data.recipientName, response: info });
    return true;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    logEmailEvent('failed', to, { status, error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
}