import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSecureHandler } from '@/lib/api-middleware'
import { ApiToken } from '@/lib/api-auth'
export const dynamic = "force-dynamic";

// Important constants
const NotificationType = {
  BID_SUBMITTED: 'BID_SUBMITTED',
  BID_EVALUATED: 'BID_EVALUATED',
  BID_AWARDED: 'BID_AWARDED',
  BID_REJECTED: 'BID_REJECTED',
  TENDER_AWARDED: 'TENDER_AWARDED',
  TENDER_CLOSED: 'TENDER_CLOSED'
} as const;

type NotificationType = typeof NotificationType[keyof typeof NotificationType];

const TenderStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  AWARDED: 'AWARDED',
  CANCELLED: 'CANCELLED'
} as const;

type TenderStatus = typeof TenderStatus[keyof typeof TenderStatus];
import { sendTenderAwardEmail, sendBidStatusEmail } from '@/lib/email-utils'

export const POST = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    // Only procurement officers can perform final evaluation
    if (token.role !== 'PROCUREMENT') {
      return NextResponse.json(
        { error: 'Permission denied', message: 'Only procurement officers can finalize bid evaluations' },
        { status: 403 }
      )
    }
    
    const data = await req.json()
    const { tenderId, winningBidId, evaluations } = data
    
    // Start a database transaction for all the updates
    const result = await prisma.$transaction(async (tx) => {
      // Get the winning bid with bidder info
      const winningBid = await tx.bid.findUnique({
        where: { 
          id: winningBidId,
        },
        include: {
          bidder: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          tender: true
        }
      })
      
      if (!winningBid) {
        throw new Error('Winning bid not found')
      }
      
      // Update tender status
      await tx.tender.update({
        where: { id: tenderId.toString() },
        data: {
          status: 'AWARDED',
        }
      })
      
      // Log the evaluation
      await tx.evaluationStage.create({
        data: {
          bidId: winningBidId,
          evaluatedBy: token.userId,
          stage: 'FINAL',
          status: 'ACCEPTED', 
          score: 100,
          comments: 'Final bid evaluation for tender award'
        }
      })
      
      // Update winning bid status
      await tx.bid.update({
        where: { id: winningBidId },
        data: {
          status: 'ACCEPTED', 
        }
      })
      
      // Create notification for winner
      await tx.notification.create({
        data: {
          type: NotificationType.BID_AWARDED,
          userId: winningBid.bidderId,
          message: `Your bid for ${winningBid.tender.title} has been selected as the winning bid.`,
          tenderId: tenderId.toString()
        }
      })
      
      // Update other bids to rejected status and notify bidders
      await tx.bid.updateMany({
        where: {
          tenderId: tenderId.toString(),
          id: { not: winningBidId }
        },
        data: {
          status: 'REJECTED'
        }
      })
      
      // Get all rejected bids to create notifications
      const rejectedBids = await tx.bid.findMany({
        where: {
          tenderId: tenderId.toString(),
          id: { not: winningBidId }
        },
        include: {
          bidder: true,
          tender: true
        }
      })
      
      // Create notifications for rejected bidders
      for (const bid of rejectedBids) {
        await tx.notification.create({
          data: {
            type: NotificationType.BID_REJECTED,
            userId: bid.bidderId,
            message: `Your bid for tender ${winningBid.tender.title} was not selected.`,
            tenderId: tenderId.toString()
          }
        })
        
        // Send rejection email with complete email data
        await sendBidStatusEmail(
          bid.bidder.email,
          'rejected',
          {
            recipientName: bid.bidder.name || 'Bidder',
            tenderTitle: winningBid.tender.title,
            bidAmount: bid.amount,
            message: 'Your bid was not selected for the final award.',
            companyName: 'N/A',
            tenderReference: winningBid.tender.id.slice(-6).toUpperCase()
          }
        )
      }
      
      // Send email to winner
      await sendTenderAwardEmail({
        to: winningBid.bidder.email,
        subject: 'Tender Award Notification',
        data: {
          recipientName: winningBid.bidder.name || 'Bidder',
          tenderTitle: winningBid.tender.title,
          bidAmount: winningBid.amount,
          message: 'Congratulations on being awarded the tender!',
          companyName: 'N/A',
          tenderReference: winningBid.tender.id.slice(-6).toUpperCase()
        }
      })
      
      return { winningBid, rejectedBids }
    })
    
    return NextResponse.json({ 
      message: 'Tender awarded successfully',
      winningBid: result.winningBid,
      rejectedCount: result.rejectedBids.length
    })
  } catch (error) {
    console.error('Error in final evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to process final evaluation' },
      { status: 500 }
    )
  }
})
