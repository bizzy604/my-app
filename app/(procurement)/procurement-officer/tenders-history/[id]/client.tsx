"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText } from 'lucide-react'
import { Timeline } from "@/components/timeline"
import { BidSummary } from "@/components/bid-summary"
import { EvaluationDetails } from "@/components/evaluation-details"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Document } from "@prisma/client"
import { BidStatus, TenderStatus } from '@prisma/client'

// Import the interfaces
import { TenderWithDetails, BidDetailsType, TimelineEventType, SingleTenderHistory, TenderWithHistory } from './types'

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

// Client component for UI interactions
export default function TenderHistoryDetailClient({ 
  tender, 
  history, 
  bids 
}: { 
  tender: any; 
  history: any; 
  bids: any[];
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  if (!tender) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{tender.title}</h1>
          </div>
          <Badge variant={getStatusVariant(tender.status)} className="capitalize">
            {tender.status.toLowerCase().replace('_', ' ')}
          </Badge>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Sector</h3>
                      <p>{tender.sector}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                      <p>{tender.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p>{tender.location}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                      <p>{formatCurrency(tender.budget)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Closing Date</h3>
                      <p>{formatDate(tender.closingDate)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                      <p>{formatDate(tender.createdAt)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="whitespace-pre-wrap">{tender.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {tender.documents && tender.documents.length > 0 ? (
                    <div className="space-y-2">
                      {tender.documents.map((doc: Document) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
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
                    <p className="text-muted-foreground">No documents available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bids">
            {bids && bids.length > 0 ? (
              <BidSummary 
                bids={bids.map((bid: any): BidDetailsType => ({
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
                  <p className="text-center text-muted-foreground">No bids available for this tender</p>
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
                  <p className="text-center text-muted-foreground">No evaluation data available</p>
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
      return 'outline'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'default'
  }
}
