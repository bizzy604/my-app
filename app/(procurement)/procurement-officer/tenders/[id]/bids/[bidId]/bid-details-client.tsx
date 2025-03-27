'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Info } from 'lucide-react'
import { formatCurrency, formatDate } from "@/lib/utils"
import { BidEvaluationForm } from "@/components/bid-evaluation-form"
import { DocumentViewer } from "@/components/document-viewer"
import { ComparativeAnalysis } from "@/components/comparative-analysis"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import { BidStatus } from "@prisma/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from 'react'

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
  evaluationScores: {
    technicalScore: number
    financialScore: number
    experienceScore: number
    totalScore: number
    comments?: string
    stage: string
    createdAt: Date
  } | null
  documents: any[]
}

export function BidDetailsClient({ 
  params,
  bid,
  evaluationScores,
  documents
}: BidDetailsClientProps) {
  const router = useRouter()
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  // Fetch existing AI analysis if available
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        const response = await fetch(`/api/crewai/ai-analysis?bidId=${params.bidId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.analysis) {
            setAiAnalysis(data.analysis)
          }
        }
      } catch (error) {
        console.error('Error fetching AI analysis:', error)
      }
    }

    fetchAIAnalysis()
  }, [params.bidId])

  const handleBack = () => {
    router.back()
  }

  const handleEvaluationComplete = () => {
    router.refresh()
  }

  const handleAwardClick = () => {
    router.push(`/procurement-officer/tenders/${params.id}/bids/${params.bidId}/award`)
  }

  const getStatusBadgeVariant = (status: BidStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'SHORTLISTED':
        return 'default'
      case 'FINAL_EVALUATION':
        return 'secondary'
      case 'TECHNICAL_EVALUATION':
        return 'outline'
      case 'UNDER_REVIEW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const renderEvaluationStatus = () => {
    if (!evaluationScores) return null

    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Evaluation Status</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            <p>Technical Score: {evaluationScores.technicalScore}%</p>
            <p>Financial Score: {evaluationScores.financialScore}%</p>
            <p>Experience Score: {evaluationScores.experienceScore}%</p>
            <p>Total Score: {evaluationScores.totalScore}%</p>
            <p>Stage: {evaluationScores.stage}</p>
            {evaluationScores.comments && (
              <p>Comments: {evaluationScores.comments}</p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
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
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
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
                  <Badge variant={getStatusBadgeVariant(bid.status)}>{bid.status}</Badge>
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
            {renderEvaluationStatus()}
            
            <Card>
              <CardHeader>
                <CardTitle>Bid Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                {!evaluationScores ? (
                  <BidEvaluationForm 
                    bid={{
                      id: bid.id,
                      tenderId: params.id,
                      currentScores: null
                    }}
                    onComplete={handleEvaluationComplete}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This bid has already been evaluated. Current status: <Badge variant={getStatusBadgeVariant(bid.status)}>{bid.status}</Badge>
                    </p>
                    {bid.status === 'SHORTLISTED' && (
                      <div>
                        <Button onClick={handleAwardClick} className="mt-4">
                          Proceed to Award
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <DocumentViewer documents={documents} />
          </TabsContent>

          <TabsContent value="ai-analysis">
            <AIAnalysisPanel 
              bidId={params.bidId}
              tenderId={params.id}
              existingAnalysis={aiAnalysis}
            />
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
