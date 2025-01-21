import { prisma } from '@/lib/prisma'
import { BidStatus } from '@prisma/client'

export async function fetchTenderBids(tenderId: string) {
  try {
    const bids = await prisma.bid.findMany({
      where: { 
        tenderId: tenderId 
      },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true
          }
        },
        documents: true
      },
      orderBy: [
        { status: 'asc' },
        { submissionDate: 'desc' }
      ]
    })

    return bids
  } catch (error) {
    console.error('Error fetching tender bids:', error)
    throw new Error('Failed to fetch tender bids')
  }
}

export async function fetchTenderDetails(tenderId: string) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        issuer: {
          select: {
            name: true,
            email: true
          }
        },
        department: true
      }
    })

    return tender
  } catch (error) {
    console.error('Error fetching tender details:', error)
    throw new Error('Failed to fetch tender details')
  }
}
