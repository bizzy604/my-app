'use client'

import React, { Suspense } from 'react'
import Link from "next/link"
import { useSession } from 'next-auth/react'
import { Bookmark, FileText, Building2, Download } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"
import { getTenderById, getTenderBids, updateBidStatus } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { BidStatus, TenderStatus } from '@prisma/client'

function TenderDetailsContent({ id }: { id: string }) {
  const { data: session } = useSession()
  const { 
    data: tenderData, 
    isLoading, 
    isClient 
  } = useHydrationSafeClient(
    async () => {
      const [tenderDetails, bidDetails] = await Promise.all([
        getTenderById(id),
        getTenderBids(id)
      ])
      return { tender: tenderDetails, bids: bidDetails }
    },
    [id]
  )

  const handleBidAction = async (bidId: string, status: BidStatus) => {
    try {
      await updateBidStatus(bidId, status)
      // Refresh bids
      const bidsData = await getTenderBids(id)
      
      return { bids: bidsData }
    } catch (error: any) {
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
            <p>Loading Tender Details...</p>
          </div>
        </DashboardLayout>
      }
    >
      {tenderData && (
        <DashboardLayout>
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Details</h1>
              <p className="text-sm text-gray-600">View and manage tender details</p>
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

          <main className="p-8">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tender Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tender Title</p>
                    <p>{tenderData.tender.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Closing Date</p>
                    <p>{formatDate(tenderData.tender.closingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p>{formatCurrency(tenderData.tender.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p>{tenderData.tender.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submitted Bids ({tenderData.bids.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tenderData.bids.length === 0 ? (
                  <p className="text-muted-foreground">No bids submitted yet</p>
                ) : (
                  <div className="space-y-4">
                    {tenderData.bids.map((bid) => (
                      <Link 
                        key={bid.id} 
                        href={`/procurement-officer/tenders/${id}/bids/${bid.id}`} 
                        className="block"
                      >
                        <div 
                          className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold">{bid.bidder.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {bid.bidder.company} | {formatCurrency(bid.amount)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault()
                                handleBidAction(bid.id, BidStatus.ACCEPTED)
                              }}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.preventDefault()
                                handleBidAction(bid.id, BidStatus.REJECTED)
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </DashboardLayout>
      )}
    </HydrationSafeLoader>
  )
}

export default function TenderDetailsPage({ params }: { params: { id: string } }) {
  const paramsPromise = React.useMemo(() => Promise.resolve(params), [params])
  const resolvedParams = React.use(paramsPromise)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenderDetailsContent id={resolvedParams.id} />
    </Suspense>
  )
}