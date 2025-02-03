'use client'

import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate } from "@/lib/utils"
import { BidEvaluationForm } from "@/components/bid-evaluation-form"
import { DocumentViewer } from "@/components/document-viewer"
import { ComparativeAnalysis } from "@/components/comparative-analysis"

export function BidDetailsClient({ 
  params,
  bid,
  evaluationScores,
  documents
}: { 
  params: { id: string, bidId: string }
  bid: any
  evaluationScores: any
  documents: any[]
}) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bids
        </Button>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Bid Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            {bid.status === 'COMPARATIVE_ANALYSIS' && (
              <TabsTrigger value="comparison">Comparative Analysis</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Bid Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Amount</h3>
                    <p>{formatCurrency(bid.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <Badge>{bid.status}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">Submission Date</h3>
                    <p>{formatDate(bid.submissionDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Completion Time</h3>
                    <p>{bid.completionTime}</p>
                  </div>
                </div>

                {evaluationScores && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Evaluation Scores</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Technical Score</p>
                        <p className="text-lg">{evaluationScores.technicalScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Financial Score</p>
                        <p className="text-lg">{evaluationScores.financialScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Experience Score</p>
                        <p className="text-lg">{evaluationScores.experienceScore}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Bid Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentViewer documents={documents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluation">
            <Card>
              <CardHeader>
                <CardTitle>Bid Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <BidEvaluationForm 
                  bid={{ 
                    id: params.bidId,
                    tenderId: params.id,
                    currentScores: evaluationScores
                  }}
                  onComplete={() => {
                    window.location.reload()
                  }}
                />
              </CardContent>
            </Card>
            
            {bid.status === 'SHORTLISTED' && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Award Tender</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      This bid has been shortlisted with the following scores:
                      <br />
                      Technical: {evaluationScores?.technicalScore}%
                      <br />
                      Financial: {evaluationScores?.financialScore}%
                      <br />
                      Experience: {evaluationScores?.experienceScore}%
                    </p>
                    <Button
                      onClick={() => window.location.href = `/procurement-officer/tenders/${params.id}/bids/${params.bidId}/award`}
                    >
                      Proceed to Award
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {bid.status === 'COMPARATIVE_ANALYSIS' && (
            <TabsContent value="comparison">
              <ComparativeAnalysis
                tenderId={params.id}
                currentBidId={params.bidId}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}