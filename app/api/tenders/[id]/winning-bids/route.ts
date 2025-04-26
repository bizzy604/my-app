import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'
import { BidStatus } from '@prisma/client'

export async function GET(
  request: NextRequest, 
  context: { params: { [key: string]: string } }
) {
  const { id: tenderId } = context.params

  try {
    // Find the most recently accepted bids for this tender
    const winningBids = await prisma.bid.findMany({
      where: {
        tenderId: tenderId,
        status: BidStatus.ACCEPTED
      },
      orderBy: {
        submissionDate: 'desc'
      },
      take: 1,
      select: {
        id: true,
        amount: true,
        bidder: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tender: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(winningBids)
  } catch (error) {
    console.error('Error fetching winning bids:', error)
    
    // Ensure error is converted to a serializable object
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(
      { error: 'Failed to fetch winning bids', details: errorMessage }, 
      { status: 500 }
    )
  }
}
