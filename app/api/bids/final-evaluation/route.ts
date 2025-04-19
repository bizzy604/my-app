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

const TenderStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  AWARDED: 'AWARDED',
  CANCELLED: 'CANCELLED'
} as const;

type BidStatus = typeof BidStatus[keyof typeof BidStatus];
type NotificationType = typeof NotificationType[keyof typeof NotificationType];
type TenderStatus = typeof TenderStatus[keyof typeof TenderStatus];
import { sendTenderAwardEmail, sendBidStatusEmail } from '@/lib/email-utils'

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession()
    
    if (!session?.user?.id || session.user.role !== 'PROCUREMENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { tenderId, winningBidId, evaluations } = data

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Get winning bid with related data
      const winningBid = await tx.bid.findUnique({
        where: { id: parseInt(winningBidId) },
        include: {
          bidder: true,
          tender: true
        }
      })

      if (!winningBid) {
        throw new Error('Winning bid not found')
      }
      const updateBidAndTender = async (tx: any) => {
        // Get winning bid with related data
        const winningBid = await tx.bid.findUnique({
          where: { id: winningBidId },
          include: {
            bidder: true,
            tender: true
          }
        })
        }

      // Update winning bid status
      await tx.bid.update({
        where: { id: parseInt(winningBidId) },
        data: { 
          status: 'ACCEPTED'
        }
      })

      // Update tender status
      await tx.tender.update({
        where: { id: tenderId.toString() },
        data: {
          status: 'AWARDED',
          awardedBidId: winningBidId.toString(),
          awardedById: session.user.id
        }
      })

      // Create bid evaluation log for the winning bid
      await tx.bidEvaluationLog.create({
        data: {
          bidId: winningBidId,
          tenderId: tenderId,
          stage: 'FINAL_EVALUATION',
          totalScore: evaluations[winningBidId]?.totalScore ?? 0,
          technicalScore: evaluations[winningBidId]?.technicalScore ?? 0,
          financialScore: evaluations[winningBidId]?.financialScore ?? 0,
          experienceScore: evaluations[winningBidId]?.experienceScore ?? 0,
          evaluatedBy: session.user.id,
          evaluatorId: session.user.id,
          comments: 'Final bid evaluation for tender award'
        }
      })

      // Update other bids to rejected
      await tx.bid.updateMany({
        where: {
          tenderId: tenderId.toString(),
          id: {
            not: parseInt(winningBidId)
          }
        },
        data: {
          status: 'REJECTED'
        }
      })

      // Notify other bidders
      const otherBids = await tx.bid.findMany({
        where: {
          tenderId: tenderId.toString(),
          id: {
            not: parseInt(winningBidId)
          }
        },
        include: {
          bidder: true
        }
      })

      for (const bid of otherBids) {
        await tx.notification.create({
          data: {
            type: 'BID_EVALUATED',
            message: `Your bid for tender ${winningBid.tender.title} was not selected.`,
            userId: bid.bidderId,
            tenderId: tenderId.toString()
          }
        })

        // Send rejection email with complete email data
        await sendBidStatusEmail(
          bid.bidder.email,
          'rejected',
          {
            recipientName: bid.bidder.name || bid.bidder.company || 'Bidder',
            tenderTitle: winningBid.tender.title,
            bidAmount: bid.amount.toString(),
            message: 'Your bid was not selected for the final award.',
            companyName: bid.bidder.company || 'N/A',
            tenderReference: winningBid.tender.id.slice(-6).toUpperCase()
          }
        )
      }

      // Notify winning bidder
      await tx.notification.create({
        data: {
          type: 'TENDER_AWARDED',
          message: `Congratulations! Your bid for tender ${winningBid.tender.title} has been accepted.`,
          userId: winningBid.bidderId,
          tenderId: tenderId.toString()
        }
      })

      // Send award email with complete email data
      await sendTenderAwardEmail({
        to: winningBid.bidder.email,
        subject: 'Tender Award Notification',
        data: {
          recipientName: winningBid.bidder.name || winningBid.bidder.company || 'Bidder',
          tenderTitle: winningBid.tender.title,
          bidAmount: winningBid.amount.toString(),
          message: 'Congratulations on being awarded the tender!',
          companyName: winningBid.bidder.company || 'N/A',
          tenderReference: winningBid.tender.id.slice(-6).toUpperCase()
        }
      })

      return { winningBid }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Award process error:', error)
    return NextResponse.json(
      { error: 'Failed to complete award process' },
      { status: 500 }
    )
  }
} 
