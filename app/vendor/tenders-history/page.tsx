'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getVendorTenders } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"
import { TenderStatus } from '@prisma/client'
import { Search } from 'lucide-react'
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TendersHistoryPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tenders, setTenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTenders = async () => {
      if (!session?.user?.id) return
      
      try {
        const data = await getVendorTenders(session.user.id)
        setTenders(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch tender history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [session?.user?.id, toast])

  const filteredTenders = tenders.filter(tender => {
    const searchLower = searchQuery.toLowerCase()
    return (
      tender.title.toLowerCase().includes(searchLower) ||
      tender.description.toLowerCase().includes(searchLower) ||
      tender.sector.toLowerCase().includes(searchLower) ||
      tender.category.toLowerCase().includes(searchLower) ||
      tender.location.toLowerCase().includes(searchLower)
    )
  })

  const getBidStatus = (tender: any) => {
    const bid = tender.bids[0]
    if (!bid) return null
    
    return {
      status: bid.status,
      color: bid.status === 'APPROVED' 
        ? 'bg-green-100 text-green-800'
        : bid.status === 'REJECTED'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading tender history...</p>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tender History</h1>
          <p className="text-sm text-gray-600">View your tender application history</p>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search tenders..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredTenders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tenders found. Start applying for tenders to see your history!
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTenders.map((tender) => {
              const bid = tender.bids[0]
              const bidStatus = getBidStatus(tender)

              return (
                <div 
                  key={tender.id} 
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-[#4B0082]">
                        {tender.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {tender.sector} • {tender.category}
                      </p>
                    </div>
                    {bidStatus && (
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${bidStatus.color}`}
                      >
                        {bidStatus.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium">
                        Rs. {formatCurrency(tender.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Closing Date</p>
                      <p className="font-medium">
                        {formatDate(tender.closingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bid Amount</p>
                      <p className="font-medium">
                        {bid ? `Rs. ${formatCurrency(bid.amount)}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        Submitted on: {formatDate(bid?.createdAt || tender.createdAt)}
                      </p>
                    </div>
                    
                    {bid && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link href={`/vendor/tenders-history/${bid.id}`}>
                          View Bid Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </VendorLayout>
  )
}