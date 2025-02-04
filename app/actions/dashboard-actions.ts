'use server'

import { prisma } from "@/lib/prisma"

export async function getDashboardStats(timeRange: string = 'month') {
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
      openTenders,
      evaluations,
      awardedContracts,
      pendingApprovals,
      anomalies,
      queries,
      recentActivities
    ] = await Promise.all([
      // Open Tenders
      prisma.tender.count({
        where: {
          status: 'OPEN',
          createdAt: { gte: startDate }
        }
      }),

      // Ongoing Evaluations
      prisma.bid.count({
        where: {
          status: 'TECHNICAL_EVALUATION',
          submissionDate: { gte: startDate }
        }
      }),

      // Awarded Contracts
      prisma.tender.count({
        where: {
          status: 'AWARDED',
          updatedAt: { gte: startDate }
        }
      }),

      // Pending Approvals
      prisma.bid.count({
        where: {
          status: 'PENDING',
          submissionDate: { gte: startDate }
        }
      }),

      // Flagged Anomalies (from reports)
      prisma.report.count({
        where: {
          type: 'IRREGULARITY',
          createdAt: { gte: startDate }
        }
      }),

      // Vendor Queries (from support tickets)
      prisma.supportTicket.count({
        where: {
          status: 'OPEN',
          createdAt: { gte: startDate }
        }
      }),

      // Recent Activities
      prisma.tender.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        }
      })
    ])

    return {
      openTenders,
      ongoingEvaluations: evaluations,
      contractsAwarded: awardedContracts,
      pendingApprovals,
      flaggedAnomalies: anomalies,
      vendorQueries: queries,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.status,
        description: activity.title,
        date: activity.createdAt.toISOString()
      })),
      // Mock anomaly data for now
      anomalyData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        values: [3, 7, 2, 9, 5]
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
} 