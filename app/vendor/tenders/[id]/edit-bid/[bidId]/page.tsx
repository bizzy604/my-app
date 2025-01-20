'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getTenderById, updateBid, getBidById } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Document } from "@prisma/client"
import { Upload } from 'lucide-react'

export default function EditBidPage({ params }: { params: { id: string, bidId: string } }) {
  const router = useRouter()
  const { data: _session } = useSession()
  const { toast } = useToast()

  const [bidData, setBidData] = useState<{
    amount: string;
    technicalProposal: string;
    documents: Document[];
  }>({
    amount: '',
    technicalProposal: '',
    documents: []
  })

  const [loading, setLoading] = useState<boolean>(true)
  const [currentBid, setCurrentBid] = useState<{
    bidder: { name: string; company: string | null };
    id: string;
    amount: number;
    technicalProposal: string;
    documents?: Document[];
    tender: {
      title: string;
      issuer: { company: string };
      closingDate: Date;
      budget: number;
    };
  } | null>(null)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const bid = await getBidById(params.bidId)
        if (!bid) {
          toast({
            title: "Error",
            description: "Bid not found",
            variant: "destructive"
          })
          router.push('/vendor/tenders-history')
          return
        }

        setCurrentBid(bid)
        setBidData({
          amount: bid.amount.toString(),
          technicalProposal: bid.technicalProposal,
          documents: bid.documents || []
        })
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load tender details",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, params.bidId, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBidData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    // Here you would typically upload the files to your storage service
    // For now, we'll just create document objects
    const newDocuments = Array.from(files).map(file => ({
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

    if (!currentBid) {
      return
    }

    try {
      setSubmitting(true)
      await updateBid({
        bidId: params.bidId,
        amount: parseFloat(bidData.amount),
        technicalProposal: bidData.technicalProposal,
        documents: bidData.documents,
      })

      toast({
        title: "Success",
        description: "Your bid has been updated successfully",
      })
      
      router.push('/vendor/tenders-history')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update bid",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!currentBid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Bid not found</p>
      </div>
    )
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Edit Bid</h1>
          <p className="text-sm text-gray-600">Update your bid for this tender</p>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#4B0082] mb-2">{currentBid.tender.title}</h2>
              <p className="text-sm text-gray-600">Posted by {currentBid.tender.issuer.company}</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>Closing Date: {formatDate(currentBid.tender.closingDate)}</p>
                <p>Budget: {formatCurrency(currentBid.tender.budget)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount">Bid Amount ($)</label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={bidData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter your bid amount"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="technicalProposal">Technical Proposal</label>
                <Textarea
                  id="technicalProposal"
                  name="technicalProposal"
                  required
                  value={bidData.technicalProposal}
                  onChange={handleInputChange}
                  placeholder="Describe your technical proposal"
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="documents">Supporting Documents</label>
                <div className="flex items-center gap-2">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('documents')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
                {bidData.documents.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {bidData.documents.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#4B0082] hover:bg-[#3B0062]"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Update Bid'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/vendor/tenders-history')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
