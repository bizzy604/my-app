'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sendSupportNotificationEmail } from '@/lib/email-utils'

interface SupportTicket {
  subject: string
  message: string
  userId?: string | null
}

export async function submitSupportTicket(data: SupportTicket) {
  try {
    if (!data.userId) {
      throw new Error('User ID is required')
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: data.subject,
        message: data.message,
        userId: data.userId,
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
        userId: data.userId,
        type: 'SUPPORT_TICKET',
        message: `New support ticket: ${data.subject}`,
        isRead: false
      }
    })

    revalidatePath('/procurement-officer/support')
    return ticket
  } catch (error) {
    console.error('Error submitting support ticket:', error)
    throw new Error('Failed to submit support ticket')
  }
}

export async function getUserTickets(userId: string) {
  try {
    return await prisma.supportTicket.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        responses: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw new Error('Failed to fetch support tickets')
  }
}

export async function addTicketResponse({
  ticketId,
  message,
  userId
}: {
  ticketId: string
  message: string
  userId: string
}) {
  try {
    const response = await prisma.supportTicketResponse.create({
      data: {
        ticketId,
        message,
        userId
      },
      include: {
        ticket: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Update ticket status
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'IN_PROGRESS' }
    })

    // Send email notification to user
    if (response.ticket.user?.email) {
      try {
        await sendSupportNotificationEmail({
          to: response.ticket.user.email,
          ticketId: response.ticket.id,
          subject: `New response to your ticket: ${response.ticket.subject}`,
          message
        })
      } catch (emailError) {
        console.error('Failed to send response notification email:', emailError)
      }
    }

    revalidatePath('/procurement-officer/support')
    return response
  } catch (error) {
    console.error('Error adding ticket response:', error)
    throw new Error('Failed to add response')
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

    // Send email notification
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