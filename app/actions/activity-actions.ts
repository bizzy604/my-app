'use server'

import { prisma } from '@/lib/prisma'
import { BidStatus, TenderStatus } from '@prisma/client'

export async function getRecentActivities(limit: number = 5) {
  try {
    const [newTenders, awardedTenders, reports] = await Promise.all([
      // Get recently created tenders
      prisma.tender.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          department: true,
          issuer: true
        }
      }),

      // Get recently awarded tenders
      prisma.tender.findMany({
        where: { status: 'AWARDED' },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: {
          bids: {
            where: { status: BidStatus.ACCEPTED },
            include: {
              bidder: true
            }
          },
          issuer: true
        }
      }),

      // Get recent reports
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tender: true
        }
      })
    ])

    // Combine and sort activities
    const activities = [
      ...newTenders.map(tender => ({
        type: 'NEW_TENDER' as const,
        title: tender.title,
        tenderId: tender.id,
        department: tender.department?.name,
        timestamp: tender.createdAt
      })),
      ...awardedTenders.map(tender => ({
        type: 'AWARDED' as const,
        title: tender.title,
        tenderId: tender.id,
        winner: tender.bids[0]?.bidder.company || tender.bids[0]?.bidder.name,
        timestamp: tender.updatedAt
      })),
      ...reports.map(report => ({
        type: 'REPORT' as const,
        tenderId: report.tenderId,
        tenderTitle: report.tender.title,
        timestamp: report.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)

    return activities

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
} 