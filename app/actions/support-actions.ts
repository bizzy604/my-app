'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sendSupportNotificationEmail } from '@/lib/email-utils'
import { getServerAuthSession } from '@/lib/auth'

interface SupportTicket {
  subject?: string
  message?: string
  userId?: string | number | null
}

export async function submitSupportTicket(subjectOrData: string | SupportTicket, message?: string) {
  try {
    let data: SupportTicket

    // Handle both object and separate arguments
    if (typeof subjectOrData === 'string') {
      if (!subjectOrData || subjectOrData.trim() === '') {
        throw new Error('Subject is required')
      }
      if (!message || message.trim() === '') {
        throw new Error('Message is required')
      }
      data = {
        subject: subjectOrData,
        message: message
      }
    } else {
      data = subjectOrData
      // Validate input
      if (!data.subject || data.subject.trim() === '') {
        throw new Error('Subject is required')
      }

      if (!data.message || data.message.trim() === '') {
        throw new Error('Message is required')
      }
    }

    // Get the current user session
    const session = await getServerAuthSession()
    
    if (!session || !session.user || !session.user.id) {
      throw new Error('You must be logged in to submit a support ticket')
    }

    // Use the user ID from the session
    const userId = session.user.id

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: data.subject!.trim(),
        message: data.message!.trim(),
        userId: Number(userId), // Ensure it's a number
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Send email notification
    if (ticket.user?.email) {
      try {
        await sendSupportNotificationEmail({
          to: ticket.user.email,
          ticketId: ticket.id,
          subject: ticket.subject
        })
      } catch (emailError) {
        console.error('Failed to send support notification email:', emailError)
        // Don't throw error here as ticket was created successfully
      }
    }

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: Number(userId),
        type: 'SUPPORT_TICKET',
        message: `New support ticket: ${data.subject}`,
        isRead: false
      }
    })

    revalidatePath('/procurement-officer/support')
    return ticket
  } catch (error) {
    console.error('Error submitting support ticket:', error)
    throw error instanceof Error ? error : new Error('Failed to submit support ticket')
  }
}

export async function getUserTickets(userId: number | string) {
  try {
    return await prisma.supportTicket.findMany({
      where: {
        userId: typeof userId === 'string' ? parseInt(userId, 10) : userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw new Error('Failed to fetch support tickets')
  }
}

export async function respondToTicket({
  ticketId,
  message,
  userId
}: {
  ticketId: string
  message: string
  userId: number | string
}) {
  try {
    // Let's ensure userId is a number
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId

    // Since supportTicketResponse doesn't exist in the schema,
    // we'll update the ticket with a comment and change its status
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'IN_PROGRESS',
        // We would typically store the response in a separate table,
        // but for now we'll just update the ticket
        message: `${message}\n\n(Response from staff: ${new Date().toISOString()})`
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Send email notification to user
    if (ticket.user?.email) {
      try {
        await sendSupportNotificationEmail({
          to: ticket.user.email,
          ticketId: ticket.id,
          subject: `New response to your ticket: ${ticket.subject}`
        })
      } catch (emailError) {
        console.error('Failed to send response notification email:', emailError)
      }
    }

    return ticket
  } catch (error) {
    console.error('Error responding to support ticket:', error)
    throw error instanceof Error ? error : new Error('Failed to respond to support ticket')
  }
}

export async function closeTicket(ticketId: string) {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (ticket.user?.email) {
      try {
        await sendSupportNotificationEmail({
          to: ticket.user.email,
          ticketId: ticket.id,
          subject: `Support ticket closed: ${ticket.subject}`
        })
      } catch (emailError) {
        console.error('Failed to send ticket closure email:', emailError)
      }
    }

    revalidatePath('/procurement-officer/support')
    return ticket
  } catch (error) {
    console.error('Error closing ticket:', error)
    throw new Error('Failed to close ticket')
  }
}
