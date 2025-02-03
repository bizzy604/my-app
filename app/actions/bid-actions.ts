'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Bid as PrismaBid, BidStatus } from '@prisma/client'

export interface Bid {
  id: string
  amount: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  submittedAt: Date
  bidder: {
    name: string
  }
}

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

export async function getTenderBids(tenderId: string): Promise<Bid[]> {
  try {
    const bids = await prisma.bid.findMany({
      where: {
        tenderId: tenderId
      },
      include: {
        bidder: {
          select: {
            name: true
          }
        }
      }
    })
    return bids
  } catch (error) {
    console.error('Error fetching bids:', error)
    throw new Error('Failed to fetch bids')
  }
}

export async function updateBidStatus(
  bidId: string, 
  status: 'ACCEPTED' | 'REJECTED'
): Promise<void> {
  try {
    await prisma.bid.update({
      where: {
        id: bidId
      },
      data: {
        status: status as BidStatus
      }
    })
    // Revalidate the bids page
    revalidatePath('/procurement-officer/tenders/[id]/bids')
  } catch (error) {
    console.error('Error updating bid status:', error)
    throw new Error('Failed to update bid status')
  }
}

export async function evaluateBid(id: string, evaluationData: { evaluationScore: number; status: BidStatus }) {
  const bid = await prisma.bid.update({
    where: { id },
    data: evaluationData,
  })
  revalidatePath(`/procurement-officer/tenders/${bid.tenderId}/bids`)
  return bid
}