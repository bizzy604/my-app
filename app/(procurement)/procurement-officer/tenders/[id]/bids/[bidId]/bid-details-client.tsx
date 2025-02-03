'use client'

import { useRouter } from 'next/navigation'
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
import { BidStatus } from "@prisma/client"

interface BidDetailsClientProps {
  params: { id: string, bidId: string }
  bid: {
    id: string
    amount: number
    status: BidStatus
    submissionDate: Date
    completionTime: string
    technicalProposal: string
    vendorExperience?: string | null
    tender: {
      title: string
    }
    bidderId: number
  }
  evaluationScores: any
  documents: any[]
}

export function BidDetailsClient({ 
  params,
  bid,
  evaluationScores,
  documents
}: BidDetailsClientProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleEvaluationComplete = () => {
    router.refresh()
  }

  const handleAwardClick = () => {
    router.push(`/procurement-officer/tenders/${params.id}/bids/${params.bidId}/award`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bids
        </Button>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Bid Details</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {bid.status === 'COMPARATIVE_ANALYSIS' && (
              <TabsTrigger value="analysis">Comparative Analysis</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bid Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(bid.amount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge>{bid.status}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submission Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDate(bid.submissionDate)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bid.completionTime}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Technical Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{bid.technicalProposal}</p>
              </CardContent>
            </Card>

            {bid.vendorExperience && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Vendor Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{bid.vendorExperience}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evaluation">
            <Card>
              <CardHeader>
                <CardTitle>Bid Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <BidEvaluationForm 
                  bid={{
                    id: bid.id,
                    tenderId: params.id,
                    currentScores: evaluationScores ? {
                      technicalScore: evaluationScores.technicalScore,
                      financialScore: evaluationScores.financialScore,
                      experienceScore: evaluationScores.experienceScore,
                      comments: evaluationScores.comments
                    } : null
                  }}
                  onComplete={handleEvaluationComplete}
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
                    <Button onClick={handleAwardClick}>
                      Proceed to Award
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <DocumentViewer documents={documents} />
          </TabsContent>

          {bid.status === 'COMPARATIVE_ANALYSIS' && (
            <TabsContent value="analysis">
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
