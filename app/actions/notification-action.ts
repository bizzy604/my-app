'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { Notification, NotificationType } from '@prisma/client'
import { sendEmail } from './email-actions'

export async function createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
  const notification = await prisma.notification.create({
    data: {
      ...data,
      isRead: false,
    },
  })
  revalidatePath(`/notifications/${data.userId}`)

  // Send email notification if email is provided
  const user = await prisma.user.findUnique({ where: { id: data.userId } })
  if (user?.email) {
    await sendEmail(
      user.email,
      'Innobid Notification',
      data.message,
      `<h1>Innobid Notification</h1><p>${data.message}</p>`
    )
  }

  return notification
}

export async function getNotificationsByUser(userId: number) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markNotificationAsRead(id: string) {
  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
  revalidatePath(`/notifications/${notification.userId}`)
  return notification
}

