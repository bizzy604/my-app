'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getBidById, awardTenderAndNotify } from "@/app/actions/tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { AwardRecommendation } from "@/components/award-recommendation"
import { AwardConfirmationDialog } from "@/components/award-confirmation-dialog"

export default function AwardBidPage({ params }: { params: { id: string, bidId: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  
  const { data: bid, isLoading } = useHydrationSafeClient(() => 
    getBidById(params.bidId)
  )

  const handleAward = async (notificationMessage: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to award tenders",
        variant: "destructive"
      })
      return
    }

    try {
      await awardTenderAndNotify(
        params.id,
        params.bidId,
        notificationMessage,
        session.user.id
      )

      toast({
        title: "Tender awarded successfully",
        description: "All relevant parties have been notified"
      })

      router.push(`/procurement-officer/tenders/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to award tender",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>
  }

  if (!bid) {
    return <DashboardLayout>Bid not found</DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <AwardRecommendation
          bid={bid}
          onAward={() => setIsConfirmationOpen(true)}
        />

        <AwardConfirmationDialog
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleAward}
          bid={bid}
        />
      </div>
    </DashboardLayout>
  )
} 