'use client'

import React, { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bookmark, FileText, Upload } from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  getTenderById, 
  checkVendorBidStatus 
} from "@/app/actions/tender-actions"
import { formatDate } from "@/lib/utils"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"

type TenderDataWithBidStatus = Awaited<ReturnType<typeof getTenderById>> & { 
  hasBid: boolean;
  bidStatus?: ReturnType<typeof checkVendorBidStatus>;
}

function TenderDetailsContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const { 
    data: tenderData, 
    isLoading, 
    isClient 
  } = useHydrationSafeClient<TenderDataWithBidStatus | null>(
    async () => {
      try {
        const tenderData = await getTenderById(id)

        // Use checkVendorBidStatus to determine if user has a bid
        const bidStatus = session?.user?.id 
          ? await checkVendorBidStatus(id, session.user.id) 
          : null

        return {
          ...tenderData,
          hasBid: !!bidStatus, // Convert to boolean
          bidStatus // Include full bid status for additional information
        }
      } catch (error) {
        console.error('Error loading tender:', error)
        toast({
          title: "Error",
          description: "Failed to load tender details",
          variant: "destructive",
        })
        return null
      }
    },
    [id, session?.user?.id]
  )

  const safeUser = safeSessionData(session)

  const handleApplyForTender = () => {
    if (!tenderData) return

    // Validate tender status and closing date
    if (tenderData.status !== 'OPEN') {
      toast({
        title: "Tender Closed",
        description: "This tender is no longer accepting applications",
        variant: "destructive",
      })
      return
    }

    if (new Date(tenderData.closingDate) < new Date()) {
      toast({
        title: "Tender Expired",
        description: "The application period for this tender has closed",
        variant: "destructive",
      })
      return
    }

    // Redirect to the tender application page
    router.push(`/vendor/tenders/${id}/apply`)
  }

  return (
    <HydrationSafeLoader 
      isLoading={isLoading} 
      isClient={isClient}
      fallback={
        <VendorLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading tender details...</p>
          </div>
        </VendorLayout>
      }
    >
      {tenderData && (
        <VendorLayout>
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Details</h1>
              <p className="text-sm text-gray-600">Review tender information and apply</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">{safeUser.name}</p>
                <p className="text-sm text-gray-600">{safeUser.company}</p>
              </div>
              <div className="relative h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </header>

          <main className="p-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-[#4B0082]">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#4B0082]">{tenderData.title}</h2>
                    <p className="text-sm text-gray-600">Posted by {tenderData.issuer.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    // Detailed condition checks
                    const isOpen = tenderData.status === 'OPEN'
                    const isNotClosed = new Date(tenderData.closingDate) > new Date()
                    const hasNoBid = !tenderData.hasBid

                    console.log('Visibility Conditions:', {
                      isOpen,
                      isNotClosed,
                      hasNoBid
                    })

                    // Detailed logging of why button might not show
                    if (!isOpen) {
                      console.warn('Button not shown: Tender is not OPEN')
                    }
                    if (!isNotClosed) {
                      console.warn('Button not shown: Tender is closed')
                    }
                    if (!hasNoBid) {
                      console.warn('Button not shown: Bid already exists')
                    }

                    // Render button only if all conditions are met
                    return (isOpen && isNotClosed && hasNoBid) ? (
                    <Button 
                      className="bg-[#4B0082] text-white hover:bg-[#3B0062]"
                      onClick={handleApplyForTender}
                    >
                      Apply for Tender
                    </Button>
                  ) : null
                  })()}
                  {tenderData.hasBid && (
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/vendor/tenders-history')}
                    >
                      View Your Application
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Bookmark className="h-4 w-4" />
                    <span className="sr-only">Bookmark tender</span>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <dl className="grid gap-2 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Issue Date:</dt>
                    <dd className="text-gray-700">{formatDate(tenderData.createdAt)}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Closing Date:</dt>
                    <dd className="text-gray-700">{formatDate(tenderData.closingDate)}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Status:</dt>
                    <dd className="text-gray-700">{tenderData.status}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Location:</dt>
                    <dd className="text-gray-700">{tenderData.location}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Budget:</dt>
                    <dd className="text-gray-700">${tenderData.budget.toLocaleString()}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="font-medium text-gray-900">Category:</dt>
                    <dd className="text-gray-700">{tenderData.category}</dd>
                  </div>
                </dl>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div className="whitespace-pre-wrap text-gray-700">{tenderData.description}</div>
              </div>

              {tenderData.requirements?.length > 0 && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                  <ul className="list-disc pl-5">
                    {tenderData.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-gray-700">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </main>
        </VendorLayout>
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