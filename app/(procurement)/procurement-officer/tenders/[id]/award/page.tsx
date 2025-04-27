'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import { getBidById, awardTenderAndNotify, getBidsForTender } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { BidStatus } from '@prisma/client'

export default function AwardTenderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [bids, setBids] = useState<any[]>([])
  const [selectedBid, setSelectedBid] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPendingBids = async () => {
      try {
        const pendingBids = await getBidsForTender(params.id)
        const filteredBids = pendingBids.filter(bid => bid.status === BidStatus.PENDING)
        setBids(filteredBids)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bids",
          variant: "destructive"
        })
      }
    }

    loadPendingBids()
  }, [params.id])

  const handleAwardTender = async () => {
    if (!selectedBid) {
      toast({
        title: "Error",
        description: "Please select a bid to award",
        variant: "destructive"
      })
      return
    }

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to award tenders",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await awardTenderAndNotify(
        params.id,
        selectedBid,
        session.user.id.toString()
      )

      toast({
        title: "Tender Awarded",
        description: "The tender has been successfully awarded",
      })

      router.push(`/procurement-officer/tenders/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to award tender",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-primary">Award Tender</h1>
        
        {bids.length === 0 ? (
          <p className="text-muted-foreground">No pending bids available for this tender.</p>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <Card 
                key={bid.id} 
                className={`cursor-pointer transition-all ${selectedBid === bid.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                onClick={() => setSelectedBid(bid.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{bid.vendor.name} - {bid.vendor.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <p className="text-primary font-medium">Bid Amount: {formatCurrency(bid.amount)}</p>
                    <p className="text-muted-foreground">Submitted: {formatDate(bid.submittedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              onClick={handleAwardTender} 
              disabled={!selectedBid || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? 'Awarding...' : 'Award Selected Bid'}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}