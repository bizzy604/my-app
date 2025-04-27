'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, DollarSign, Users, FileCheck } from 'lucide-react'
import { getTenderHistory } from "@/app/actions/tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TenderStatus } from '@prisma/client'

interface TenderHistory {
  id: string
  title: string
  reference: string
  status: TenderStatus
  budget: number
  closingDate: string
  lastUpdate?: string
  lastUpdateBy?: string
  awardedTo?: string
  bidsCount: number
}

export default function TendersHistoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const { data: tendersData, isLoading } = useHydrationSafeClient(() => 
    getTenderHistory()
  )

  const tenders: TenderHistory[] = useMemo(() => {
    if (!tendersData) return []
    
    return tendersData.map((tender: any) => ({
      id: tender.id,
      title: tender.title,
      reference: tender.reference,
      status: tender.status,
      budget: tender.budget,
      closingDate: tender.closingDate?.toISOString() || '',
      lastUpdate: tender.history?.[0]?.changeDate?.toISOString() || '',
      lastUpdateBy: tender.history?.[0]?.changedByUser?.name || '',
      awardedTo: tender.bids?.find((b: { status: string; bidder?: { name: string } }) => b.status === 'ACCEPTED')?.bidder?.name || '',
      bidsCount: tender.bids?.length || 0
    }))
  }, [tendersData])

  const filteredTenders = tenders.filter((tender: TenderHistory) => {
    const matchesSearch = 
      (tender?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tender?.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || tender?.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="AWARDED">Awarded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 bg-muted/50" />
              </Card>
            ))
          ) : filteredTenders.map((tender) => (
            <Card 
              key={tender.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/procurement-officer/tenders-history/${tender.id}`)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{tender.title}</h3>
                      <p className="text-sm text-muted-foreground">Ref: {tender.reference}</p>
                    </div>
                    <Badge variant={getStatusVariant(tender.status)}>
                      {tender.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Closed: {formatDate(tender.closingDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Budget: {formatCurrency(tender.budget)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Bids: {tender.bidsCount}</span>
                    </div>
                    {tender.status === 'AWARDED' && (
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span>Awarded to: {tender.awardedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'default'
    case 'CLOSED':
      return 'secondary'
    case 'AWARDED':
      return 'outline'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'default'
  }
} 