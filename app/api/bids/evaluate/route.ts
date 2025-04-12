import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'

const BidStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;

const NotificationType = {
  BID_SUBMITTED: 'BID_SUBMITTED',
  BID_EVALUATED: 'BID_EVALUATED',
  TENDER_AWARDED: 'TENDER_AWARDED',
  TENDER_CLOSED: 'TENDER_CLOSED'
} as const;

type BidStatus = typeof BidStatus[keyof typeof BidStatus];
type NotificationType = typeof NotificationType[keyof typeof NotificationType];

function determineStage(scores: { 
  technicalScore: number, 
  financialScore: number, 
  experienceScore: number 
}): string {
  const totalScore = (
    (scores.technicalScore * 0.4) +
    (scores.financialScore * 0.4) +
    (scores.experienceScore * 0.2)
  )
  
  if (totalScore >= 80) return 'FINAL'
  if (totalScore >= 70) return 'FINANCIAL'
  if (totalScore >= 60) return 'TECHNICAL'
  return 'INITIAL'
}

function determineBidStatus(stage: string): BidStatus {
  switch (stage) {
    case 'FINAL':
      return 'ACCEPTED'
    case 'FINANCIAL':
      return 'UNDER_REVIEW'
    case 'TECHNICAL':
      return 'UNDER_REVIEW'
    default:
      return 'PENDING'
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession()
    
    if (!session?.user?.id || session.user.role !== 'PROCUREMENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { bidId, tenderId, technicalScore, financialScore, experienceScore, comments } = data

    // Validate scores
    if (
      technicalScore < 0 || technicalScore > 100 ||
      financialScore < 0 || financialScore > 100 ||
      experienceScore < 0 || experienceScore > 100
    ) {
      return NextResponse.json(
        { error: 'Scores must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Calculate total score
    const scores = { technicalScore, financialScore, experienceScore }
    const stage = determineStage(scores)
    const totalScore = (
      (technicalScore * 0.4) +
      (financialScore * 0.4) +
      (experienceScore * 0.2)
    )

    // Check if bid has already been evaluated
    const existingEvaluation = await prisma.evaluationStage.findFirst({
      where: {
        bidId: bidId.toString(),
        evaluator: {
          id: session.user.id
        }
      }
    })

    if (existingEvaluation) {
      return NextResponse.json(
        { error: 'Bid has already been evaluated by you' },
        { status: 400 }
      )
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create evaluation record
      const evaluation = await tx.evaluationStage.create({
        data: {
          bidId: bidId.toString(),
          evaluatedBy: session.user.id,
          stage: stage,
          score: totalScore,
          status: determineBidStatus(stage),
          comments
        }
      })

      // Update bid status based on score
      const newStatus = determineBidStatus(stage)
      
            const updatedBid = await tx.bid.update({
        where: { id: bidId.toString() },
        data: { 
          status: determineBidStatus(stage),
          updatedAt: new Date()
        },
        include: {
          bidder: true,
          tender: true
        }
      })

      // Create notification for bidder
      await tx.notification.create({
        data: {
          type: 'BID_EVALUATED',
          message: `Your bid for tender ${updatedBid.tender.title} has been evaluated. Status: ${newStatus}`,
          userId: updatedBid.bidderId,
          tenderId: tenderId.toString()
        }
      })

      // If bid is under review, send email notification
      if (newStatus === 'UNDER_REVIEW') {
        await tx.notification.create({
          data: {
            type: 'BID_EVALUATED',
            userId: updatedBid.bidderId,
            message: `Your bid for tender "${updatedBid.tender.title}" is under review.`,
            tenderId: tenderId.toString()
          }
        })
      }

      return { evaluation, bid: updatedBid }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate bid' },
      { status: 500 }
    )
  }
}
