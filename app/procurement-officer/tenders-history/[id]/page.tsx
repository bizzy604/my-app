'use client'

import React, { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Building2, ThumbsUp, ThumbsDown, Clock, ArrowLeft, Download, Mail } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"
import { useToast } from "@/hooks/use-toast"
import { getBidById, updateBidStatus, getTenderBids } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { BidStatus } from '@prisma/client'

function BidDetailsCard({ bid }: { bid: any & { bidder: any } }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Bid Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Bid Amount</p>
            <p className="text-lg font-semibold">{formatCurrency(bid.amount)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estimated Completion Time</p>
            <p>{bid.completionTime || 'Not specified'}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Technical Proposal</p>
          <p className="text-sm">{bid.technicalProposal}</p>
        </div>
        
        {bid.vendorExperience && (
          <div>
            <p className="text-sm font-medium text-gray-500">Vendor Experience</p>
            <p className="text-sm">{bid.vendorExperience}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-gray-500">Supporting Documents</p>
          {bid.documents && bid.documents.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {bid.documents.map((doc) => (
                <li key={doc.id}>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    {doc.fileName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TenderBidDetailsContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const { 
    data: bidData, 
    isLoading, 
    isClient 
  } = useHydrationSafeClient(
    async () => {
      try {
        const tenderBids = await getTenderBids(id)
        
        if (!tenderBids || tenderBids.length === 0) {
          throw new Error(`No bids found for tender ${id}`)
        }

        const selectedBid = tenderBids[0]
        const bidDetails = await getBidById(selectedBid.id)
        
        return bidDetails
      } catch (error: any) {
        console.error('Error in TenderBidDetailsPage:', error)
        router.push('/procurement-officer/tenders-history')
        return null
      }
    },
    [id]
  )

  const safeUser = safeSessionData(session)

  const handleBidAction = async (status: BidStatus) => {
    if (!bidData) return

    try {
      await updateBidStatus(bidData.id, status)
      
      toast({
        title: "Success",
        description: `Bid ${status.toLowerCase()} successfully`,
      })

      router.push('/procurement-officer/tenders-history')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update bid status",
        variant: "destructive",
      })
    }
  }

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
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push('/procurement-officer/tenders-history')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-[#4B0082]">Bid Details</h1>
                <p className="text-sm text-gray-600">Detailed information about the bid</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">{safeUser.name}</p>
                <p className="text-sm text-gray-600">Procurement Officer</p>
              </div>
              <div className="relative h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </header>

          <main className="p-8 space-y-6">
            <BidDetailsCard bid={bidData} />
            
            {/* Bid Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Bid Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleBidAction(BidStatus.ACCEPTED)}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" /> Accept Bid
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleBidAction(BidStatus.REJECTED)}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject Bid
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </DashboardLayout>
      )}
    </HydrationSafeLoader>
  )
}

export default function TenderBidDetailsPage({ params }: { params: { id: string } }) {
  const paramsPromise = React.useMemo(() => Promise.resolve(params), [params])
  const resolvedParams = React.use(paramsPromise)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenderBidDetailsContent id={resolvedParams.id} />
    </Suspense>
  )
}