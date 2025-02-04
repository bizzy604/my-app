'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit,
  Trash,
  ArrowLeft
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DocumentManager } from "@/components/document-manager"
import { useToast } from "@/hooks/use-toast"
import { ShortlistedBidsPanel } from "@/components/shortlisted-bids-panel"
import { Tender, Bid, BidStatus, Document } from '@prisma/client'

interface TenderDetailsContentProps {
  tender: Tender & {
    bids?: Array<Bid & {
      bidder: {
        name: string
        company: string
      }
    }>
    documents?: Document[]
  }
  shortlistedBids: Array<{
    id: string
    amount: number
    status: string
    score: number
    bidder: {
      name: string
      company: string
    }
    evaluationStages: Array<{
      stage: string
      score: number
      comments: string
    }>
  }>
}

export function TenderDetailsContent({ tender, shortlistedBids }: TenderDetailsContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/procurement-officer/tenders/${tender.id}/edit`)
  }

  const handleDelete = async () => {
    // ... existing delete logic ...
  }

  const handleViewBids = () => {
    router.push(`/procurement-officer/tenders/${tender.id}/bids`)
  }

  // Check if evaluation is complete (has shortlisted bids)
  const hasShortlistedBids = shortlistedBids.length > 0

  // Check if all bids are still under evaluation
  const hasOngoingEvaluation = tender.bids?.some(
    bid => bid.status === BidStatus.UNDER_REVIEW || 
           bid.status === BidStatus.TECHNICAL_EVALUATION
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-sm md:text-base"
        >
          <ArrowLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">{tender.title}</h1>
          <p className="text-sm md:text-base text-gray-600">Tender Details</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          onClick={handleEdit}
          variant="outline"
          className="text-sm md:text-base"
        >
          <Edit className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Edit</span>
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={isDeleting}
          className="text-sm md:text-base"
        >
          <Trash className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </Button>
        
        {/* Show different button based on evaluation status */}
        {hasShortlistedBids ? (
          <Button
            onClick={() => router.push(`/procurement-officer/tenders/${tender.id}/award`)}
            className="bg-green-600 text-white hover:bg-green-700 text-sm md:text-base"
          >
            <Users className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Proceed to Award</span>
          </Button>
        ) : hasOngoingEvaluation ? (
          <Button
            onClick={() => router.push(`/procurement-officer/tenders/${tender.id}/evaluate`)}
            className="bg-[#4B0082] text-white hover:bg-purple-700 text-sm md:text-base"
          >
            <Users className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Continue Evaluation</span>
          </Button>
        ) : (
          <Button
            onClick={handleViewBids}
            className="bg-[#4B0082] text-blue hover:bg-purple-700 text-sm md:text-base"
          >
            <Users className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">View & Evaluate Bids</span>
          </Button>
        )}
      </div>

      {/* Basic Tender Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-gray-600">{tender.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{tender.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Closing: {new Date(tender.closingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>Budget: {tender.budget.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{tender.category}</Badge>
              <Badge variant="outline">{tender.sector}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Requirements & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Requirements</h3>
              <p className="text-gray-600">{tender.requirements}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Documents</h3>
              <DocumentManager 
                tenderId={tender.id}
                userId={session?.user?.id || ''}
                documents={tender.documents || []}
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bids Section - Show if not shortlisted yet */}
      {!hasShortlistedBids && tender.bids && tender.bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Submitted Bids
              </div>
              <Button
                onClick={handleViewBids}
                className="bg-[#4B0082] text-white hover:bg-purple-700"
              >
                View & Evaluate Bids
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tender.bids.map((bid) => (
                <div 
                  key={bid.id}
                  className="p-4 border rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{bid.bidder.company}</h3>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(bid.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge>
                      {bid.amount.toLocaleString()}
                    </Badge>
                    <Badge variant={
                      bid.status === BidStatus.UNDER_REVIEW ? 'secondary' :
                      bid.status === BidStatus.TECHNICAL_EVALUATION ? 'default' :
                      bid.status === BidStatus.SHORTLISTED ? 'outline' :
                      'destructive'
                    }>
                      {bid.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shortlisted Bids Panel - Only show if evaluation is complete */}
      {hasShortlistedBids && (
        <ShortlistedBidsPanel 
          tenderId={tender.id}
          bids={shortlistedBids}
        />
      )}
    </div>
  )
} 