'use server'

import { prisma } from '@/lib/prisma'
import { Prisma, TenderStatus, TenderSector, TenderCategory } from '@prisma/client'
import { getServerAuthSession } from '@/lib/auth'

export async function getPaginatedTenders(filters?: {
  status?: TenderStatus
  sector?: TenderSector
  category?: TenderCategory
  page?: number
  pageSize?: number
}) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    const where: Prisma.TenderWhereInput = {}
    
    // Only apply procurement officer isolation for users with PROCUREMENT role
    // Vendors and citizens should see all tenders
    if (session?.user?.role === 'PROCUREMENT') {
      // Only show tenders where this procurement officer is the issuer or assigned procurement officer
      where.OR = [
        { issuerId: session.user.id },
        { procurementOfficerId: session.user.id }
      ];
    }
    
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.sector) {
      where.sector = filters.sector
    }
    if (filters?.category) {
      where.category = filters.category
    }

    // Set default pagination values if not provided
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.tender.count({ where });

    const tenders = await prisma.tender.findMany({
      where,
      include: {
        issuer: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                company: true,
                email: true,
              }
            },
            documents: true
          },
          orderBy: {
            submissionDate: 'desc'
          }
        },
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    })

    const paginatedTenders = tenders.map(tender => ({
      ...tender,
      bidCount: tender.bids.length,
      totalBidAmount: tender.bids.reduce((sum, bid) => sum + (bid.amount || 0), 0)
    }));

    return {
      tenders: paginatedTenders,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    console.error('Failed to fetch tenders:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to fetch tenders: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
