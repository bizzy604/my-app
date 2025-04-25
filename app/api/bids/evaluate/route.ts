import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSecureHandler } from '@/lib/api-middleware'
import { ApiToken } from '@/lib/api-auth'

import { BidStatus } from '@prisma/client';

const NotificationType = {
  BID_SUBMITTED: 'BID_SUBMITTED',
  BID_EVALUATED: 'BID_EVALUATED',
  TENDER_AWARDED: 'TENDER_AWARDED',
  TENDER_CLOSED: 'TENDER_CLOSED'
} as const;

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
      return BidStatus.FINAL_EVALUATION
    case 'FINANCIAL':
      return BidStatus.SHORTLISTED
    case 'TECHNICAL':
      return BidStatus.TECHNICAL_EVALUATION
    default:
      return BidStatus.UNDER_REVIEW
  }
}

export const POST = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    if (token.role !== 'PROCUREMENT') {
      return NextResponse.json(
        { error: 'Permission denied', message: 'Only procurement officers can evaluate bids' },
        { status: 403 }
      );
    }
    
    const data = await req.json()
    const { bidId, tenderId, technicalScore, financialScore, experienceScore, comments } = data

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

    const scores = { technicalScore, financialScore, experienceScore }
    const stage = determineStage(scores)
    const totalScore = (
      (technicalScore * 0.4) +
      (financialScore * 0.4) +
      (experienceScore * 0.2)
    )

    const existingEvaluation = await prisma.evaluationStage.findFirst({
      where: {
        bidId: bidId.toString(),
        evaluator: {
          id: token.userId
        }
      }
    })

    if (existingEvaluation) {
      return NextResponse.json(
        { error: 'Bid has already been evaluated by you' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluationStage.create({
        data: {
          bidId: bidId.toString(),
          evaluatedBy: token.userId,
          stage: stage,
          score: totalScore,
          status: determineBidStatus(stage),
          comments
        }
      })

      await tx.bidEvaluationLog.create({
        data: {
          bidId: bidId.toString(),
          tenderId: tenderId.toString(),
          evaluatedBy: token.userId,
          evaluatorId: token.userId,
          stage: stage,
          totalScore: totalScore,
          technicalScore: technicalScore,
          financialScore: financialScore,
          experienceScore: experienceScore,
          comments: comments || ''
        }
      })

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

      await tx.notification.create({
        data: {
          type: 'BID_EVALUATED',
          message: `Your bid for tender ${updatedBid.tender.title} has been evaluated. Status: ${newStatus}`,
          userId: updatedBid.bidderId,
          tenderId: tenderId.toString()
        }
      })

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
})
