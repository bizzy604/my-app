'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Building2, 
  FileText,
  Clock
} from 'lucide-react'
import { Timeline } from "@/components/timeline"
import { BidSummary } from "@/components/bid-summary"
import { EvaluationDetails } from "@/components/evaluation-details"
import { getTenderById, getTenderHistory, getTenderBids } from "@/app/actions/tender-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { Document } from "@prisma/client"
import { BidStatus, TenderStatus, Prisma } from '@prisma/client'

interface TenderWithDetails {
  id: string
  title: string
  status: string
  description: string
  sector: string
  category: string
  location: string
  budget: number
  closingDate: Date
  createdAt: Date
  documents: Document[]
  bids: Array<{
    id: string
    amount: number
    status: BidStatus
    bidder: {
      name: string
      company: string | null
    }
    evaluationLogs?: Array<{
      score: number
      technicalScore: number | null
      financialScore: number | null
    }>
  }>
}

interface BidDetailsType {
  id: string
  amount: number
  status: string
  bidder: {
    name: string
    company: string
  }
  evaluationScore?: number
  technicalScore?: number
  financialScore?: number
}

interface SingleTenderHistory {
  id: string
  status: TenderStatus
  tenderId: string
  changedBy: number
  changeDate: Date
  comments: string | null
  previousValues: Prisma.JsonValue
  newValues: Prisma.JsonValue
  changedByUser: {
    name: string
    email: string
  }
}

interface TenderWithHistory {
  bids: Array<{
    bidder: {
      name: string
      company: string | null
    }
    id: string
    tenderId: string
    status: BidStatus
  }>
  history: Array<{
    id: string
    status: TenderStatus
    changedByUser: {
      name: string
    }
    changeDate: Date
    comments: string | null
  }>
}

interface TimelineEventType {
  id: string
  status: string
  date: string
  comments?: string
  changedBy: {
    name: string
  }
}

// Type guard functions
function isSingleTenderHistory(history: any): history is SingleTenderHistory[] {
  return Array.isArray(history) && 
         history.length > 0 && 
         'changedByUser' in history[0] && 
         'email' in history[0].changedByUser;
}

function isTenderWithHistory(history: any): history is TenderWithHistory {
  return !Array.isArray(history) && 
         'bids' in history && 
         'history' in history;
}

export default function TenderHistoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: tender, isLoading } = useHydrationSafeClient(() => 
    getTenderById(params.id)
  )

  const { data: history } = useHydrationSafeClient(() => 
    getTenderHistory(params.id)
  )

  const { data: bids } = useHydrationSafeClient(() => 
    getTenderBids(params.id)
  )

  // Add console logs to debug
  console.log('Tender Data:', tender)
  console.log('History Data:', history)
  console.log('Bids Data:', bids)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!tender) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Tender Not Found</h2>
            <p className="mt-2 text-gray-600">The tender you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => router.push('/procurement-officer/tenders-history')}
              className="mt-4"
            >
              Back to Tenders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#4B0082]">{tender.title}</h1>
            <p className="text-sm text-gray-600">Reference: {tender.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <Badge 
            variant={
              tender.status === 'OPEN' ? 'default' :
              tender.status === 'CLOSED' ? 'secondary' :
              tender.status === 'AWARDED' ? 'outline' :
              'destructive'
            }
          >
            {tender.status}
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tender Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1">{tender.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="mt-1">{tender.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sector</p>
                    <p className="mt-1">{tender.sector}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p className="mt-1">{formatCurrency(tender.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Publication Date</p>
                    <p className="mt-1">{formatDate(tender.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Closing Date</p>
                    <p className="mt-1">{formatDate(tender.closingDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tender Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {tender.documents && tender.documents.length > 0 ? (
                  <div className="space-y-2">
                    {tender.documents.map((doc: Document) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{doc.fileName}</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bids">
            {bids && bids.length > 0 ? (
              <BidSummary 
                bids={bids.map((bid): BidDetailsType => ({
                  id: bid.id,
                  amount: bid.amount,
                  status: bid.status.toString(),
                  bidder: {
                    name: bid.bidder?.name || 'Unknown',
                    company: bid.bidder?.company || 'N/A'
                  },
                  evaluationScore: bid.evaluationLogs?.[0]?.totalScore,
                  technicalScore: bid.evaluationLogs?.[0]?.technicalScore,
                  financialScore: bid.evaluationLogs?.[0]?.financialScore
                }))}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No bids available for this tender</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evaluation">
            {bids && bids.length > 0 ? (
              bids.map((bid) => (
                <EvaluationDetails key={bid.id} bid={bid} />
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No evaluation data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Timeline events={(() => {
              if (!history) return [];
              
              // If it's a single tender history
              if (isSingleTenderHistory(history)) {
                return history.map((event): TimelineEventType => ({
                  id: event.id,
                  status: event.status,
                  date: event.changeDate.toISOString(),
                  comments: event.comments || undefined,
                  changedBy: {
                    name: event.changedByUser.name
                  }
                }));
              }
              
              // If it's a tender with history property
              if (isTenderWithHistory(history)) {
                return history.history.map((event): TimelineEventType => ({
                  id: event.id,
                  status: event.status,
                  date: event.changeDate.toISOString(),
                  comments: event.comments || undefined,
                  changedBy: {
                    name: event.changedByUser.name
                  }
                }));
              }
              
              return [];
            })()} />
          </TabsContent>
        </Tabs>
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
      return 'success'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'default'
  }
}