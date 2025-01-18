'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { Bid, BidStatus } from '@prisma/client'

export async function submitBid(data: Omit<Bid, 'id' | 'submissionDate' | 'status' | 'evaluationScore'>) {
  const bid = await prisma.bid.create({
    data: {
      ...data,
      status: BidStatus.PENDING,
    },
  })
  revalidatePath(`/procurement-officer/tenders/${bid.tenderId}`)
  return bid
}

export async function getBidsByVendor(vendorId: number) {
  return prisma.bid.findMany({
    where: { bidderId: vendorId },
    include: { tender: true },
  })
}

export async function getBidById(id: string) {
  return prisma.bid.findUnique({
    where: { id },
    include: { bidder: true, tender: true },
  })
}

export async function getBidsByTender(tenderId: string) {
  return prisma.bid.findMany({
    where: { tenderId },
    include: { bidder: true },
  })
}

export async function evaluateBid(id: string, evaluationData: { evaluationScore: number; status: BidStatus }) {
  const bid = await prisma.bid.update({
    where: { id },
    data: evaluationData,
  })
  revalidatePath(`/procurement-officer/tenders/${bid.tenderId}/bids`)
  return bid
}