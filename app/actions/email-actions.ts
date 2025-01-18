'use server'

import nodemailer from 'nodemailer'

// In a production environment, you would use environment variables for these settings
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'Innobid@procurement.com',
    pass: 'your-password'
  }
})

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    await transporter.sendMail({
      from: '"Innobid" <noreply@innobid.com>',
      to,
      subject,
      text,
      html
    })
    console.log('Email sent successfully')
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}