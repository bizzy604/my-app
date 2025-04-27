'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTenderBids } from "@/app/actions/tender-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BidStatus } from '@prisma/client'
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { LoadingSpinner } from "@/components/loading-spinner"

interface BidsPageProps {
  params: { id: string }
}

export default function TenderBidsPage({ params }: BidsPageProps) {
  const router = useRouter()
  const { data: bidsResult, isLoading } = useHydrationSafeClient(() => getTenderBids(params.id))
  
  // Handle the error case by checking if bidsResult is empty or null
  const bids = bidsResult || []
  const hasError = !bidsResult && !isLoading

  const getBidStatusBadge = (status: BidStatus) => {
    switch (status) {
      case BidStatus.SHORTLISTED:
        return <Badge>Shortlisted</Badge>
      case BidStatus.FINAL_EVALUATION:
        return <Badge variant="secondary">Final Evaluation</Badge>
      case BidStatus.TECHNICAL_EVALUATION:
        return <Badge variant="outline">Technical Evaluation</Badge>
      case BidStatus.UNDER_REVIEW:
        return <Badge variant="outline">Under Review</Badge>
      case BidStatus.COMPARATIVE_ANALYSIS:
        return <Badge>Under Comparison</Badge>
      case BidStatus.ACCEPTED:
        return <Badge variant="default">Accepted</Badge>
      case BidStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Under Review</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : hasError ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Error loading bids. Please try again.</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : bids && bids.length > 0 ? (
          <div className="grid gap-4">
            {bids.map((bid) => (
              <Card key={bid.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{bid.bidder.company}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {bid.bidder.name} on {formatDate(bid.submissionDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      {getBidStatusBadge(bid.status)}
                      <Button
                        onClick={() => router.push(`/procurement-officer/tenders/${params.id}/bids/${bid.id}`)}
                      >
                        View & Evaluate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bid Amount:</span>
                      <span className="font-medium ml-2 text-foreground">{formatCurrency(bid.amount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <span className="font-medium ml-2 text-foreground">{bid.documents.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Stage:</span>
                      <span className="font-medium ml-2 text-foreground">
                        {bid.evaluationLogs && bid.evaluationLogs.length > 0 
                          ? bid.evaluationLogs[bid.evaluationLogs.length - 1].stage 
                          : 'Initial Review'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No bids found</p>
            <p className="mt-2">There are no bids submitted for this tender yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 