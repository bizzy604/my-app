'use client'

import React, { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FileText, Building2, Download, CheckCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"
import { getBidById, updateBidStatus } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { BidStatus, TenderStatus } from '@prisma/client'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function BidDetailsContent({ tenderId, bidId }: { tenderId: string, bidId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { 
    data: bidData, 
    isLoading, 
    isClient 
  } = useHydrationSafeClient(
    async () => {
      const bidDetails = await getBidById(bidId)
      return bidDetails
    },
    [bidId]
  )

  const handleBidAction = async (status: BidStatus) => {
    try {
      const updatedBid = await updateBidStatus(bidId, status, tenderId)
      
      if (status === BidStatus.ACCEPTED) {
        toast({
          title: 'Bid Accepted',
          description: `The bid from ${bidData?.bidder.name} has been accepted.`,
          variant: 'default'
        })
        // Redirect to message page with bid details
        router.push(`/procurement-officer/tenders/${tenderId}/message`)
      } else if (status === BidStatus.REJECTED) {
        toast({
          title: 'Bid Rejected',
          description: `The bid from ${bidData?.bidder.name} has been rejected.`,
          variant: 'destructive'
        })
        // Redirect back to tender bids page
        router.push(`/procurement-officer/tenders/${tenderId}`)
      }

      return updatedBid
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || "Failed to update bid status",
        variant: 'destructive'
      })
      throw new Error(error.message || "Failed to update bid status")
    }
  }

  const safeUser = safeSessionData(session)

  return (
    <HydrationSafeLoader 
      isLoading={isLoading} 
      isClient={isClient}
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading Bid Details...</p>
          </div>
        </DashboardLayout>
      }
    >
      {bidData && (
        <DashboardLayout>
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#4B0082]">Bid Details</h1>
              <p className="text-sm text-gray-600">Review and evaluate bid submission</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">{safeUser.name}</p>
                <p className="text-sm text-gray-600">Procurement Officer</p>
              </div>
              <div className="relative h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </header>

          <main className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <Link 
                href={`/procurement-officer/tenders/${tenderId}`} 
                className="text-blue-600 hover:underline"
              >
                ← Back to Tender Bids
              </Link>
              <div className="flex space-x-3">
                {bidData.status === BidStatus.PENDING && (
                  <>
                    <Button 
                      variant="default" 
                      onClick={() => handleBidAction(BidStatus.ACCEPTED)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" /> Accept Bid
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleBidAction(BidStatus.REJECTED)}
                    >
                      <XCircle className="mr-2 h-5 w-5" /> Reject Bid
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bidder Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{bidData.bidder.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p>{bidData.bidder.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{bidData.bidder.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bid Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Amount</p>
                    <p>{formatCurrency(bidData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submission Date</p>
                    <p>{formatDate(bidData.submissionDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`
                      font-semibold
                      ${bidData.status === BidStatus.PENDING ? 'text-yellow-600' : ''}
                      ${bidData.status === BidStatus.ACCEPTED ? 'text-green-600' : ''}
                      ${bidData.status === BidStatus.REJECTED ? 'text-red-600' : ''}
                    `}>
                      {bidData.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Time</p>
                    <p>{bidData.completionTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bidData.technicalProposal && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{bidData.technicalProposal}</p>
                </CardContent>
              </Card>
            )}

            {bidData.documents && bidData.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bidData.documents.map((doc, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between border p-3 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span>{doc.fileName}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </DashboardLayout>
      )}
    </HydrationSafeLoader>
  )
}

export default function BidDetailsPage({ params }: { params: { id: string, bidId: string } }) {
  const paramsPromise = React.useMemo(() => Promise.resolve(params), [params])
  const resolvedParams = React.use(paramsPromise)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BidDetailsContent 
        tenderId={resolvedParams.id} 
        bidId={resolvedParams.bidId} 
      />
    </Suspense>
  )
}
