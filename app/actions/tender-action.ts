'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createNotification } from './notification-action'
import { Tender, TenderStatus } from '@prisma/client'

export async function createTender(data: Omit<Tender, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const tender = await prisma.tender.create({
    data: {
      ...data,
      status: TenderStatus.OPEN,
    },
  })
  revalidatePath('/tenders')
  return tender
}

export async function getTenders() {
  return prisma.tender.findMany()
}

export async function getTenderById(id: string) {
  return prisma.tender.findUnique({
    where: { id },
    include: {
      issuer: true,
      bids: true,
    },
  })
}

export async function updateTender(id: string, data: Partial<Tender>) {
  const tender = await prisma.tender.update({
    where: { id },
    data,
  })
  revalidatePath(`/tenders/${id}`)
  return tender
}

export async function deleteTender(id: string) {
  await prisma.tender.delete({ where: { id } })
  revalidatePath('/tenders')
}

export async function awardTender(id: string, winningBidId: string) {
  const tender = await prisma.tender.update({
    where: { id },
    data: {
      status: TenderStatus.AWARDED,
      bids: {
        update: {
          where: { id: winningBidId },
          data: { status: 'ACCEPTED' },
        },
      },
    },
    include: {
      bids: {
        include: { bidder: true },
      },
    },
  })

  // Notify the winning bidder
  await createNotification({
    userId: tender.bids.find(bid => bid.id === winningBidId)?.bidderId!,
    message: `Congratulations! Your bid for tender "${tender.title}" has been accepted.`,
    type: 'SUCCESS',
  })

  // Notify other bidders
  for (const bid of tender.bids) {
    if (bid.id !== winningBidId) {
      await createNotification({
        userId: bid.bidderId,
        message: `The tender "${tender.title}" has been awarded to another bidder.`,
        type: 'INFO',
      })
    }
  }

  revalidatePath('/tenders')
  revalidatePath('/procurement/tenders')
  return tender
}

