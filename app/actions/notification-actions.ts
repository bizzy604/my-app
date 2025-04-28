'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'

export enum NotificationType {
  TENDER_AWARD = 'TENDER_AWARD',
  BID_STATUS_UPDATE = 'BID_STATUS_UPDATE',
  TENDER_STATUS_UPDATE = 'TENDER_STATUS_UPDATE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  MESSAGE = 'MESSAGE',
  REMINDER = 'REMINDER'
}

interface NotificationData {
  type: NotificationType
  message: string
  userId: number
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
      }
    })
    revalidatePath('/procurement-officer/notifications')
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw new Error('Failed to create notification')
  }
}

export async function getNotifications(userId?: string) {
  try {
    const parsedUserId = userId ? parseInt(userId, 10) : undefined

    const notifications = await prisma.notification.findMany({
      where: parsedUserId ? {
        userId: parsedUserId
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return notifications.map(notification => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      type: notification.type as NotificationType
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    revalidatePath('/procurement-officer/notifications')
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw new Error('Failed to mark notification as read')
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id }
    })

    revalidatePath('/procurement-officer/notifications')
    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw new Error('Failed to delete notification')
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })
    revalidatePath('/notifications')
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    throw new Error('Failed to mark all notifications as read')
  }
}
