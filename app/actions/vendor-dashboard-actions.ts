'use server'

import { prisma } from "@/lib/prisma"
import { BidStatus, TenderStatus } from "@prisma/client"

export async function getVendorDashboardStats(vendorId: string, timeRange: string = 'month') {
  try {
    const startDate = new Date()
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1)
    }

    // Get all relevant data in parallel
    const [
      activeBids,
      wonTenders,
      pendingEvaluations,
      totalBids,
      recentActivities,
      upcomingDeadlines,
      financialOverview
    ] = await Promise.all([
      // Active Bids
      prisma.bid.count({
        where: {
          bidderId: parseInt(vendorId),
          status: BidStatus.UNDER_REVIEW,
          submissionDate: { gte: startDate }
        }
      }),

      // Won Tenders
      prisma.bid.count({
        where: {
          bidderId: parseInt(vendorId),
          status: BidStatus.ACCEPTED,
          submissionDate: { gte: startDate }
        }
      }),

      // Pending Evaluations
      prisma.bid.count({
        where: {
          bidderId: parseInt(vendorId),
          status: BidStatus.PENDING,
          submissionDate: { gte: startDate }
        }
      }),

      // Total Bids (for success rate calculation)
      prisma.bid.count({
        where: {
          bidderId: parseInt(vendorId),
          submissionDate: { gte: startDate }
        }
      }),

      // Recent Activities
      prisma.bid.findMany({
        where: {
          bidderId: parseInt(vendorId),
          submissionDate: { gte: startDate }
        },
        include: {
          tender: {
            select: {
              title: true,
              status: true
            }
          }
        },
        orderBy: {
          submissionDate: 'desc'
        },
        take: 5
      }),

      // Upcoming Deadlines
      prisma.tender.findMany({
        where: {
          status: TenderStatus.OPEN,
          closingDate: { gte: new Date() }
        },
        orderBy: {
          closingDate: 'asc'
        },
        take: 5
      }),

      // Financial Overview
      prisma.bid.findMany({
        where: {
          bidderId: parseInt(vendorId),
          status: BidStatus.ACCEPTED,
          submissionDate: { gte: startDate }
        },
        select: {
          amount: true,
          submissionDate: true
        }
      })
    ])

    // Calculate success rate
    const successRate = totalBids > 0 
      ? (wonTenders / totalBids) * 100 
      : 0

    // Calculate total value of won tenders
    const totalValue = financialOverview.reduce(
      (sum, bid) => sum + (bid.amount || 0), 
      0
    )

    return {
      activeBids,
      wonTenders,
      pendingEvaluations,
      successRate,
      totalValue,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.tender.status,
        description: activity.tender.title,
        date: activity.submissionDate.toISOString()
      })),
      upcomingDeadlines: upcomingDeadlines.map(tender => ({
        id: tender.id,
        title: tender.title,
        closingDate: tender.closingDate.toISOString()
      })),
      // Monthly bid distribution for chart
      bidDistribution: financialOverview.reduce((acc, bid) => {
        const month = bid.submissionDate.toLocaleString('default', { month: 'short' })
        acc[month] = (acc[month] || 0) + bid.amount
        return acc
      }, {} as Record<string, number>)
    }
  } catch (error) {
    console.error('Error fetching vendor dashboard stats:', error)
    throw new Error('Failed to fetch vendor dashboard statistics')
  }
}
