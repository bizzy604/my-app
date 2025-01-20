'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { Feedback } from '@prisma/client'

export async function submitFeedback(data: Omit<Feedback, 'id' | 'createdAt'>) {
  const feedback = await prisma.feedback.create({
    data,
  })
  revalidatePath(`/tenders/${data.tenderId}`)
  return feedback
}

export async function getFeedbackByTender(tenderId: string) {
  return prisma.feedback.findMany({
    where: { tenderId },
    include: { user: true },
  })
}

