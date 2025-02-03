import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BidStatus, NotificationType } from '@prisma/client'

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
      return BidStatus.FINAL_EVALUATION
    case 'FINANCIAL':
      return BidStatus.SHORTLISTED
    case 'TECHNICAL':
      return BidStatus.TECHNICAL_EVALUATION
    default:
      return BidStatus.UNDER_REVIEW
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
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
        bidId,
        evaluator: {
          id: parseInt(session.user.id)
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
    const result = await prisma.$transaction(async (tx) => {
      // Create evaluation record
      const evaluation = await tx.evaluationStage.create({
        data: {
          bidId,
          evaluatedBy: parseInt(session.user.id),
          stage: stage,
          score: totalScore,
          status: determineBidStatus(stage),
          comments
        }
      })

      // Update bid status based on score
      const newStatus = determineBidStatus(stage)
      
      const updatedBid = await tx.bid.update({
        where: { id: bidId },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        },
        include: {
          bidder: true,
          tender: true
        }
      })

      // Create notification for the bidder
      await tx.notification.create({
        data: {
          type: NotificationType.BID_STATUS_UPDATE,
          userId: updatedBid.bidderId,
          message: `Your bid for tender "${updatedBid.tender.title}" has been evaluated. Status: ${newStatus}`,
        }
      })

      // If bid is shortlisted, send email notification
      if (newStatus === BidStatus.SHORTLISTED) {
        await tx.notification.create({
          data: {
            type: NotificationType.BID_STATUS_UPDATE,
            userId: updatedBid.bidderId,
            message: `Congratulations! Your bid for tender "${updatedBid.tender.title}" has been shortlisted.`,
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
