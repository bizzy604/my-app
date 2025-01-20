'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'

export async function createNotification(data: {
  userId: number
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
}) {
  try {
    const notification = await prisma.notification.create({
      data,
    })
    revalidatePath('/notifications')
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    throw new Error('Failed to create notification')
  }
}

export async function getNotifications(userId: number) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return notifications
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    throw new Error('Failed to fetch notifications')
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    revalidatePath('/notifications')
    return notification
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    throw new Error('Failed to mark notification as read')
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
