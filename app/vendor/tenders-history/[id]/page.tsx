"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Building2, ThumbsUp, ThumbsDown, Clock, ArrowLeft, Download, Mail } from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBidById } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TenderBidDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [bid, setBid] = useState<any>(null)

  useEffect(() => {
    const fetchBidDetails = async () => {
      try {
        setLoading(true)
        const bidDetails = await getBidById(id)
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
  }, [id, toast])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      default:
        return 'Pending Review'
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading bid details...</p>
        </div>
      </VendorLayout>
    )
  }

  if (!bid) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>No bid details found</p>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vendor/tenders-history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Bid Details</h1>
            <p className="text-sm text-gray-600">Review submitted tender application</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-sm text-gray-600">Vendor</p>
          </div>
          <div className="relative h-12 w-12">
            <Image
              src="/placeholder.svg"
              alt="Profile picture"
              fill
              className="rounded-full object-cover"
            />
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        </div>
      </header>

      <main className="p-8 space-y-6">
        {/* Tender and Bid Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tender</h3>
                  <p className="mt-1 text-lg font-medium">{bid.tender.title}</p>
                  <p className="text-sm text-gray-600">Reference: {bid.tender.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Applicant</h3>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{bid.bidder.name}</p>
                      <p className="text-sm text-gray-600">{bid.bidder.company}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bid Status</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(bid.status)}
                    <span className="font-medium">{getStatusText(bid.status)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Proposed Price</h3>
                  <p className="mt-1 text-lg font-medium">
                    Rs. {formatCurrency(bid.amount)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p className="mt-1">
                    {formatDate(bid.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Proposal */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{bid.technicalProposal}</div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {bid.documents && bid.documents.length > 0 ? (
                bid.documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {(doc.fileSize / 1024).toFixed(2)} KB, {doc.fileType}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </VendorLayout>
  )
}