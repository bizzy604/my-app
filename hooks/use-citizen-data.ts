import { useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getTenders } from "@/app/actions/tender-actions"
import { getReports } from "@/app/actions/report-actions"
import { TenderStatus } from '@prisma/client'

interface UseDataOptions {
  pageSize?: number
  filters?: {
    status?: TenderStatus
    sector?: string
    dateRange?: [Date, Date]
  }
}

export function useCitizenData(options: UseDataOptions = {}) {
  const { pageSize = 10, filters } = options

  // Fetch tenders with infinite loading
  const {
    data: tendersData,
    fetchNextPage: fetchNextTenders,
    hasNextPage: hasMoreTenders,
    isLoading: tendersLoading,
    error: tendersError
  } = useInfiniteQuery({
    queryKey: ['tenders', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getTenders({
        status: filters?.status,
        skip: pageParam * pageSize,
        take: pageSize,
        ...filters
      })
      return response
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === pageSize ? pages.length : undefined
    }
  })

  // Fetch statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['tender-stats'],
    queryFn: async () => {
      const [activeTenders, awardedTenders, reports] = await Promise.all([
        getTenders({ status: 'OPEN' }),
        getTenders({ status: 'AWARDED' }),
        getReports()
      ])

      return {
        activeTenders: activeTenders.length,
        recentlyAwarded: awardedTenders.length,
        reportedIrregularities: reports.length,
        sectorDistribution: calculateSectorDistribution(activeTenders),
        monthlyTrends: calculateMonthlyTrends([...activeTenders, ...awardedTenders])
      }
    },
    staleTime: 5 * 60 * 1000 // Consider data fresh for 5 minutes
  })

  return {
    tenders: tendersData?.pages.flat() ?? [],
    stats,
    fetchNextTenders,
    hasMoreTenders,
    isLoading: tendersLoading || statsLoading,
    error: tendersError || statsError
  }
}

// Helper functions for statistics
function calculateSectorDistribution(tenders: any[]) {
  return tenders.reduce((acc, tender) => {
    acc[tender.sector] = (acc[tender.sector] || 0) + 1
    return acc
  }, {})
}

function calculateMonthlyTrends(tenders: any[]) {
  return tenders.reduce((acc, tender) => {
    const month = new Date(tender.createdAt).toLocaleString('default', { month: 'long' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})
} 