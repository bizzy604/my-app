'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerAuthSession } from '@/lib/auth'

export async function getPaginatedTenderHistory(page: number = 1, pageSize: number = 10, tenderId?: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;
    
    // Prepare where clause
    const where = tenderId ? { id: tenderId } : {};
    
    // Get total count for pagination
    const totalCount = await prisma.tender.count({ where });

    // Get tenders with their history
    const tenders = await prisma.tender.findMany({
      where,
      include: {
        issuer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          }
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
            }
          }
        },
        history: {
          include: {
            changedByUser: true
          },
          orderBy: {
            changeDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: pageSize
    });

    return {
      tenders,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    console.error('Failed to fetch tender history:', error);
    throw new Error(`Failed to fetch tender history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
