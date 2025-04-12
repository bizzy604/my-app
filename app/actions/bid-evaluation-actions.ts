import { prisma } from '@/lib/prisma'
import { BidStatus, TenderStatus } from '@prisma/client'
import { getServerSession } from '@/lib/auth'

export interface BidEvaluationCriteria {
  technicalScore?: number
  financialScore?: number
  experienceScore?: number
  totalScore?: number
  comments?: string
}

export async function evaluateBid(
  bidId: string, 
  tenderId: string, 
  criteria: BidEvaluationCriteria
) {
  // Ensure only procurement officers can evaluate
  const session = await getServerSession()
  if (!session || session.user.role !== 'PROCUREMENT') {
    throw new Error('Unauthorized: Only procurement officers can evaluate bids')
  }

  // Validate input
  if (!bidId || !tenderId) {
    throw new Error('Bid ID and Tender ID are required')
  }

  // Validate scores
  const { 
    technicalScore = 0, 
    financialScore = 0, 
    experienceScore = 0, 
    comments = '' 
  } = criteria

  if (
    technicalScore < 0 || technicalScore > 100 ||
    financialScore < 0 || financialScore > 100 ||
    experienceScore < 0 || experienceScore > 100
  ) {
    throw new Error('Scores must be between 0 and 100')
  }

  // Calculate total score (you can adjust the weighting as needed)
  const totalScore = (
    (technicalScore * 0.4) + 
    (financialScore * 0.4) + 
    (experienceScore * 0.2)
  )

  // Start a transaction to ensure data consistency
  return prisma.$transaction(async (tx) => {
    // Update bid with evaluation details
    const updatedBid = await tx.bid.update({
      where: { 
        id: bidId,
        tenderId: tenderId 
      },
      data: {
        status: BidStatus.EVALUATED,
        evaluationScore: totalScore,
        technicalScore,
        financialScore,
        experienceScore,
        evaluationComments: comments,
        statusUpdatedAt: new Date()
      }
    })

    // Create an evaluation log
    await tx.bidEvaluationLog.create({
      data: {
        bidId,
        tenderId,
        evaluatedBy: session.user.id,
        technicalScore,
        financialScore,
        experienceScore,
        totalScore,
        comments
      }
    })

    return updatedBid
  })
}

export async function awardTenderToBid(
  bidId: string, 
  tenderId: string
) {
  // Ensure only procurement officers can award
  const session = await getServerSession()
  if (!session || session.user.role !== 'PROCUREMENT') {
    throw new Error('Unauthorized: Only procurement officers can award tenders')
  }

  // Start a transaction to ensure data consistency
  return prisma.$transaction(async (tx) => {
    // First, update all bids for this tender to rejected status
    await tx.bid.updateMany({
      where: { 
        tenderId: tenderId,
        id: { not: bidId }
      },
      data: { 
        status: BidStatus.REJECTED 
      }
    })

    // Update the winning bid to accepted
    const winningBid = await tx.bid.update({
      where: { 
        id: bidId,
        tenderId: tenderId 
      },
      data: { 
        status: BidStatus.ACCEPTED,
        approvalDate: new Date()
      }
    })

    // Update tender status to awarded
    await tx.tender.update({
      where: { id: tenderId },
      data: { 
        status: TenderStatus.AWARDED,
        awardedBidId: bidId
      }
    })

    // Create an award log
    await tx.tenderAwardLog.create({
      data: {
        tenderId,
        bidId,
        awardedBy: session.user.id
      }
    })

    return winningBid
  })
}

export async function getBidDetailsForEvaluation(bidId: string) {
  return prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      bidder: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          businessType: true
        }
      },
      tender: true,
      documents: true,
      evaluationLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })
}

export async function getTenderBidsWithDetails(tenderId: string) {
  return prisma.bid.findMany({
    where: { tenderId },
    include: {
      bidder: {
        select: {
          id: true,
          name: true,
          company: true,
          businessType: true
        }
      },
      documents: true,
      _count: {
        select: { documents: true }
      }
    },
    orderBy: [
      { status: 'asc' },
      { evaluationScore: 'desc' }
    ]
  })
}
