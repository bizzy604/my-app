import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BidStatus, NotificationType, TenderStatus } from '@prisma/client'
import { sendTenderAwardEmail, sendBidStatusEmail } from '@/lib/email-utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'PROCUREMENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { tenderId, winningBidId, evaluations } = data

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get winning bid with related data
      const winningBid = await tx.bid.findUnique({
        where: { id: winningBidId },
        include: {
          bidder: true,
          tender: true
        }
      })

      if (!winningBid) {
        throw new Error('Winning bid not found')
      }

      // Update winning bid status
      await tx.bid.update({
        where: { id: winningBidId },
        data: { 
          status: BidStatus.ACCEPTED
        }
      })

      // Update tender status
      await tx.tender.update({
        where: { id: tenderId },
        data: {
          status: TenderStatus.AWARDED,
          awardedBidId: winningBidId,
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

      // Update other bids
      const otherBids = await tx.bid.findMany({
        where: {
          tenderId,
          id: { not: winningBidId },
          status: BidStatus.FINAL_EVALUATION
        },
        include: {
          bidder: true
        }
      })

      for (const bid of otherBids) {
        // Log bid and winning bid details for debugging
        console.log('Bid Details:', JSON.stringify(bid, null, 2))
        console.log('Winning Bid Details:', JSON.stringify(winningBid, null, 2))

        // Update bid status
        await tx.bid.update({
          where: { id: bid.id },
          data: { 
            status: BidStatus.REJECTED
          }
        })

        // Create rejection notification
        const rejectionNotification = {
          type: 'BID_STATUS_UPDATE',
          userId: bid.bidderId,
          message: `Your bid for tender "${winningBid.tender.title}" was not successful.`,
          tenderId: tenderId,
          bidId: bid.id
        }
        console.log('Rejection Notification Payload:', JSON.stringify(rejectionNotification, null, 2))

        await tx.notification.create({
          data: rejectionNotification
        })

        // Send rejection email
        await sendBidStatusEmail(
          bid.bidder.email,
          'rejected',
          {
            tenderTitle: winningBid.tender.title,
            bidAmount: bid.amount,
            comments: evaluations[bid.id]?.comments ?? 'No specific comments provided'
          }
        )
      }

      // Create award notification
      const awardNotification = {
        type: 'TENDER_AWARD',
        userId: winningBid.bidderId,
        message: `Congratulations! Your bid for tender "${winningBid.tender.title}" has been awarded.`,
        tenderId: tenderId,
        bidId: winningBidId
      }
      console.log('Award Notification Payload:', JSON.stringify(awardNotification, null, 2))

      await tx.notification.create({
        data: awardNotification
      })

      // Send award email
      await sendTenderAwardEmail(
        winningBid.bidder.email,
        'awarded',
        {
          tenderTitle: winningBid.tender.title,
          bidAmount: winningBid.amount,
          companyName: winningBid.bidder.company || ''
        }
      )

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
