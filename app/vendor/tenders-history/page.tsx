'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { getBidHistory } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"

interface BidHistory {
  id: string
  amount: number
  status: string
  submittedAt: Date
  completionTime: string
  tender: {
    title: string
    description: string
    status: string
  }
  documents: Array<{
    id: string
    fileName: string
    url: string
  }>
}

export default function TendersHistoryPage() {
  const { data: session } = useSession()
  const [bids, setBids] = useState<BidHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      if (session?.user?.id) {
        try {
          const history = await getBidHistory(parseInt(session.user.id))
          setBids(history)
        } catch (error) {
          console.error('Error fetching bid history:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchBids()
  }, [session])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Accepted</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500"><XCircle className="w-4 h-4 mr-1" /> Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" /> Pending</Badge>
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B0082]"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tender Applications History</h1>
        <div className="grid gap-6">
          {bids.map((bid) => (
            <Link key={bid.id} href={`/vendor/tenders-history/${bid.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <span className="text-lg font-semibold">{bid.tender.title}</span>
                    {getStatusBadge(bid.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bid Amount</p>
                      <p className="font-medium">{formatCurrency(bid.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submission Date</p>
                      <p className="font-medium">{formatDate(bid.submittedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Documents</p>
                      <p className="font-medium">{bid.documents.length} files</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completion Time</p>
                      <p className="font-medium">{bid.completionTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {bids.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p className="text-lg font-medium">No bid history found</p>
                <p className="mt-2">You haven't submitted any bids yet.</p>
                <Link href="/vendor/tenders">
                  <button className="mt-4 px-4 py-2 bg-[#4B0082] text-white rounded-md hover:bg-[#3B0062]">
                    Browse Tenders
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </VendorLayout>
  )
}