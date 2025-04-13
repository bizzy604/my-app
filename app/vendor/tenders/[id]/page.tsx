'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bookmark, FileText, Upload, Download, ArrowLeft, MapPin, Calendar, DollarSign } from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  getTenderById, 
  checkVendorBidStatus 
} from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TenderDataWithBidStatus = Awaited<ReturnType<typeof getTenderById>> & { 
  hasBid: boolean;
  bidStatus?: ReturnType<typeof checkVendorBidStatus>;
}

function TenderDetailsContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tender, setTender] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const data = await getTenderById(id)
        setTender(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tender details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTender()
  }, [id])

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </VendorLayout>
    )
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </VendorLayout>
    )
  }

  if (!tender) {
    return (
      <VendorLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-bold mb-2">Tender Not Found</h2>
          <p className="text-gray-600 mb-4">The requested tender could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </VendorLayout>
    )
  }

  const safeUser = safeSessionData(session)

  const handleApplyForTender = () => {
    if (!tender) return

    // Validate tender status and closing date
    if (tender.status !== 'OPEN') {
      toast({
        title: "Tender Closed",
        description: "This tender is no longer accepting applications",
        variant: "destructive",
      })
      return
    }

    if (new Date(tender.closingDate) < new Date()) {
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
    <VendorLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hidden md:flex"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">{tender.title}</h1>
            <p className="text-sm md:text-base text-gray-600">Tender Details</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{tender.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Closes: {formatDate(tender.closingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget: {formatCurrency(tender.budget)}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{tender.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {tender.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Tender Documents Section */}
              {tender.documents && tender.documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tender Documents</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {tender.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#4B0082]" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-[#4B0082] hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleApplyForTender}
                  className="w-full md:w-auto"
                >
                  Apply for Tender
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}

export default function TenderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <TenderDetailsContent id={params.id} />
    </ErrorBoundary>
  )
}