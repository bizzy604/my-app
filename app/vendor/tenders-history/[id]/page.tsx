"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Building2, ThumbsUp, ThumbsDown, Clock, ArrowLeft, Download, FileText } from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getBidById } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

interface BidDetail {
  id: string
  amount: number
  status: string
  submissionDate: Date
  completionTime: string
  technicalProposal: string
  vendorExperience?: string | null
  tender: {
    id: string
    title: string
    description: string
    budget: number
    closingDate: Date
    status: string
  }
  bidder: {
    name: string
    company: string
    email: string
  }
  documents: Array<{
    id: string
    fileName: string
    fileType: string
    fileSize: number
    url: string
    uploadDate: Date
  }>
  evaluationLogs?: Array<{
    stage: string
    totalScore: number
    comments: string | null
    evaluator: {
      name: string
    }
    createdAt: Date
    technicalScore: number
    financialScore: number
    experienceScore: number
  }>
}

export default function TenderBidDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bid, setBid] = useState<BidDetail | null>(null)

  useEffect(() => {
    const fetchBidDetails = async () => {
      try {
        setLoading(true)
        const bidDetails = await getBidById(params.id)
        setBid(bidDetails)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch bid details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBidDetails()
  }, [params.id, toast])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500">Accepted</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending Review</Badge>
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B0082]"></div>
        </div>
      </VendorLayout>
    )
  }

  if (!bid) {
    return (
      <VendorLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg text-gray-500">Bid not found</p>
              <Link href="/vendor/tenders-history">
                <Button className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      {/* Responsive Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/vendor/tenders-history">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#4B0082] line-clamp-1">
                Tender Bid Details
              </h1>
              <p className="text-sm text-gray-600">Review submitted tender application</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-12 sm:ml-0">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-600">Vendor</p>
            </div>
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              <Image
                src="/placeholder.svg"
                alt="Profile picture"
                fill
                className="rounded-full object-cover"
              />
              <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button and Status */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/vendor/tenders-history">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
          <div className="w-full sm:w-auto flex justify-end">
            {getStatusText(bid.status)}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6">
          {/* Tender Details Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-2">
              <CardTitle className="text-lg sm:text-xl font-bold line-clamp-2">
                {bid.tender.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-sm sm:text-base">{bid.tender.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Tender Budget</h3>
                    <p className="text-base sm:text-lg font-medium">
                      {formatCurrency(bid.tender.budget)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Closing Date</h3>
                    <p className="text-sm sm:text-base">
                      {formatDate(bid.tender.closingDate)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Tender Status</h3>
                    <p className="flex items-center gap-2 text-sm sm:text-base">
                      {getStatusIcon(bid.tender.status)}
                      <span>{bid.tender.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bid Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Your Bid Amount</h3>
                    <p className="text-base sm:text-lg font-medium">
                      {formatCurrency(bid.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Completion Time</h3>
                    <p className="text-sm sm:text-base">{bid.completionTime}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                    <p className="text-sm sm:text-base">{formatDate(bid.submissionDate)}</p>
                  </div>
                </div>

                <Separator className="my-2 sm:my-4" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Technical Proposal</h3>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{bid.technicalProposal}</p>
                </div>

                {bid.vendorExperience && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Relevant Experience</h3>
                    <p className="text-sm sm:text-base whitespace-pre-wrap">{bid.vendorExperience}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {bid.documents.length > 0 ? (
                <div className="divide-y">
                  {bid.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500 shrink-0 mt-1 sm:mt-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">{doc.fileName}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {(doc.fileSize / 1024).toFixed(2)} KB • {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </VendorLayout>
  )
}