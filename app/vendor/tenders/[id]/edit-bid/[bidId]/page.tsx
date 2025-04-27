'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DocumentViewer } from '@/components/document-viewer'
import { getBidById, updateBid } from '@/app/actions/bid-actions'
import { DashboardLayout } from '@/components/dashboard-layout'
import { UploadIcon } from 'lucide-react'

// Define a more complete document type that matches the API expectations
interface ApiDocument {
  id: string
  url: string
  bidId: string | null
  tenderId: string | null
  fileName: string
  fileSize: number
  fileType: string
  s3Key: string | null
  uploadDate: Date
  userId: number
  reportId: string | null
}

// Define a simpler document type for UI purposes that matches the DocumentViewer requirements
interface UiDocument {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
}

// Define the bid interface that matches what comes from the API
interface Bid {
  id: string;
  amount: number;
  technicalProposal: string;
  documents?: ApiDocument[];
  tender: {
    id: string;
    title: string;
    budget: number;
    closingDate: Date;
    issuer: {
      company: string;
    };
  };
  bidder: {
    id: number;
    name: string;
    company: string | null;
  };
  status: string;
}

export default function EditBidPage({ params }: { params: { id: string, bidId: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [bidData, setBidData] = useState<{
    amount: string;
    technicalProposal: string;
    documents: UiDocument[];
  }>({
    amount: '',
    technicalProposal: '',
    documents: []
  })

  const [loading, setLoading] = useState<boolean>(true)
  const [currentBid, setCurrentBid] = useState<Bid | null>(null)
  const [isEditable, setIsEditable] = useState<boolean>(true)
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    async function loadBid() {
      try {
        const bid = await getBidById(params.bidId) as unknown as Bid
        
        if (!bid) {
          throw new Error('Bid not found')
        }

        // Ensure the bid has the expected structure
        const adaptedBid: Bid = {
          ...bid,
          tender: {
            ...bid.tender,
            issuer: bid.tender.issuer || { company: 'Unknown Company' }
          }
        }

        setCurrentBid(adaptedBid)
        setBidData({
          amount: adaptedBid.amount.toString(),
          technicalProposal: adaptedBid.technicalProposal,
          documents: (adaptedBid.documents || []).map((doc: ApiDocument) => ({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            url: doc.url
          }))
        })

        // Check if bid is editable based on status
        const nonEditableStatuses = [
          'COMPARATIVE_ANALYSIS', 
          'FINAL_EVALUATION', 
          'ACCEPTED', 
          'REJECTED'
        ]
        
        if (nonEditableStatuses.includes(adaptedBid.status)) {
          setIsEditable(false)
          setStatusMessage(
            "This bid cannot be edited because it's in an advanced evaluation stage. Please contact the procurement officer if you need to make changes."
          )
        } else if (adaptedBid.status === 'TECHNICAL_EVALUATION' || adaptedBid.status === 'SHORTLISTED') {
          setStatusMessage(
            "Warning: Editing this bid will reset some evaluation progress. Your bid will need to be re-evaluated."
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load bid data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadBid()
  }, [params.bidId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBidData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const files = Array.from(e.target.files)
    const newDocuments: UiDocument[] = files.map(file => ({
      id: crypto.randomUUID(),  // Generate a temporary ID
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: URL.createObjectURL(file), // In production, this would be the uploaded file URL
    }))

    setBidData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBid || !isEditable) {
      return
    }

    try {
      // Convert UI documents to API format
      const apiDocuments = bidData.documents.map(doc => ({
        id: doc.id || crypto.randomUUID(),
        url: doc.url,
        bidId: params.bidId,
        tenderId: params.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        s3Key: null,
        uploadDate: new Date(),
        userId: session?.user?.id || 0,
        reportId: null
      }))

      // Determine if status needs to be reset based on current status
      let statusUpdate = {}
      if (currentBid.status === 'TECHNICAL_EVALUATION' || currentBid.status === 'SHORTLISTED') {
        statusUpdate = { status: 'UNDER_REVIEW' }
      }

      await updateBid(params.bidId, {
        amount: parseFloat(bidData.amount),
        technicalProposal: bidData.technicalProposal,
        documents: apiDocuments,
        ...statusUpdate
      })

      toast({
        title: "Success",
        description: "Bid updated successfully",
      })

      router.push(`/vendor/tenders/${params.id}`)
    } catch (error) {
      console.error('Error updating bid:', error)
      toast({
        title: "Error",
        description: "Failed to update bid. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p>Loading bid data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!currentBid) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <h2 className="text-xl font-semibold mb-2">Bid Not Found</h2>
          <p className="text-muted-foreground mb-4">The bid you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push(`/vendor/tenders/${params.id}`)}>
            Return to Tender
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Bid</CardTitle>
            {statusMessage && (
              <div className={`mt-2 p-3 rounded-md text-sm ${isEditable ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                {statusMessage}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2">{currentBid.tender.title}</h2>
              <p className="text-sm text-muted-foreground">Posted by {currentBid.tender.issuer.company}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Closing Date: {currentBid.tender.closingDate.toLocaleDateString()}</p>
                <p>Budget: {currentBid.tender.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Bid Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={bidData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalProposal" className="text-sm font-medium">Technical Proposal</Label>
                <Textarea
                  id="technicalProposal"
                  name="technicalProposal"
                  value={bidData.technicalProposal}
                  onChange={handleInputChange}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents" className="text-sm font-medium">Supporting Documents</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="documents"
                    name="documents"
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById('documents')?.click()}
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {bidData.documents.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Uploaded Documents</h3>
                  <DocumentViewer documents={bidData.documents} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!isEditable}
                >
                  Update Bid
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.push(`/vendor/tenders/${params.id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
