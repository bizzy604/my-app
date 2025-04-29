'use server'

import { prisma } from '@/lib/prisma'
import { BidStatus } from '@prisma/client'

export async function getPaginatedTenderBids(tenderId: string, page: number = 1, pageSize: number = 10) {
  try {
    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await prisma.bid.count({
      where: {
        tenderId: tenderId
      }
    });

    // Get paginated bids
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
            email: true,
          }
        },
        documents: true,
        evaluationLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        evaluationStages: true
      },
      orderBy: {
        submissionDate: 'desc'
      },
      skip,
      take: pageSize
    });

    return {
      bids,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    console.error('Failed to fetch paginated tender bids:', error);
    throw new Error('Failed to fetch tender bids');
  }
}
