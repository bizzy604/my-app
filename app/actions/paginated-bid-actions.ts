'use server'

import { prisma } from '@/lib/prisma'
import { BidStatus } from '@prisma/client'

export async function getPaginatedBidHistory(userId: number, page: number = 1, pageSize: number = 10) {
  try {
    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await prisma.bid.count({
      where: {
        bidderId: userId
      }
    });

    // Get paginated bids
    const bids = await prisma.bid.findMany({
      where: {
        bidderId: userId
      },
      include: {
        tender: {
          select: {
            title: true,
            description: true,
            status: true
          }
        },
        documents: {
          select: {
            id: true,
            url: true,
            fileType: true,
            fileName: true
          }
        },
        evaluationStages: {
          select: {
            stage: true,
            score: true
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      },
      skip,
      take: pageSize
    });

    // Transform the bids to the expected format with proper type safety
    const formattedBids = bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      submittedAt: bid.submissionDate,
      completionTime: bid.completionTime,
      tender: {
        title: bid.tender.title,
        description: bid.tender.description,
        status: bid.tender.status
      },
      documents: bid.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        url: doc.url
      })),
      evaluations: bid.evaluationStages || []
    }));

    return {
      bids: formattedBids,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    console.error('Error fetching bid history:', error);
    throw error;
  }
}
