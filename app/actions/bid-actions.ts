'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Bid as PrismaBid, BidStatus } from '@prisma/client'

export interface Bid {
  id: string
  amount: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  submissionDate: Date
  bidder: {
    name: string
  }
  completionTime?: string
  technicalProposal?: string
}

export async function submitBid(data: { 
  amount: number;
  tenderId: string; 
  bidderId: number;
  technicalProposal?: string;
  completionTime?: string;
}) {
  const bid = await prisma.bid.create({
    data: {
      amount: data.amount,
      status: BidStatus.PENDING,
      completionTime: data.completionTime || '30 days',
      technicalProposal: data.technicalProposal || '',
      submissionDate: new Date(),
      tender: {
        connect: { id: data.tenderId }
      },
      bidder: {
        connect: { id: data.bidderId }
      }
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
    include: { bidder: true, tender: true, documents: true },
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
    
    return bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
      submissionDate: bid.submissionDate,
      bidder: {
        name: bid.bidder.name
      },
      completionTime: bid.completionTime,
      technicalProposal: bid.technicalProposal
    }))
  } catch (error) {
    console.error('Error fetching bids:', error)
    throw new Error('Failed to fetch bids')
  }
}

/**
 * Update an existing bid with new data
 */
export async function updateBid(
  bidId: string, 
  data: {
    amount: number;
    technicalProposal: string;
    documents?: any[];
    status?: BidStatus; 
  }
) {
  try {
    const updateData: any = {
      amount: data.amount,
      technicalProposal: data.technicalProposal,
    }

    // Only update status if provided
    if (data.status) {
      updateData.status = data.status
      
      // When status is reset to UNDER_REVIEW, also clear evaluation scores
      if (data.status === BidStatus.UNDER_REVIEW) {
        updateData.evaluationScore = null
      }
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: updateData,
      include: {
        tender: true,
        bidder: true
      }
    })

    if (data.documents && data.documents.length > 0) {
      for (const doc of data.documents) {
        if (doc.id) {
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              fileType: doc.fileType,
              url: doc.url,
              bidId: bidId
            }
          })
        } else {
          await prisma.document.create({
            data: {
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              fileType: doc.fileType,
              url: doc.url,
              bidId: bidId,
              userId: doc.userId,
              tenderId: doc.tenderId,
              uploadDate: new Date()
            }
          })
        }
      }
    }

    // Revalidate paths to ensure UI is updated
    revalidatePath(`/vendor/tenders/${updatedBid.tenderId}`)
    revalidatePath(`/procurement-officer/tenders/${updatedBid.tenderId}/bids`)

    return updatedBid
  } catch (error) {
    console.error('Error updating bid:', error)
    throw new Error('Failed to update bid')
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