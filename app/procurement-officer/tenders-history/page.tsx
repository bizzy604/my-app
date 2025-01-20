'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from "next/image"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getTenders } from "@/app/actions/tender-actions"
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
    const loadTenders = async () => {
      try {
        const data = await getTenders()
        setTenders(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load tenders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTenders()
  }, [toast])

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

  const getStatusColor = (status: TenderStatus) => {
    switch (status) {
      case TenderStatus.OPEN:
        return 'bg-green-100 text-green-800'
      case TenderStatus.CLOSED:
        return 'bg-red-100 text-red-800'
      case TenderStatus.AWARDED:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tender History</h1>
          <p className="text-sm text-gray-600">View and manage all past tenders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-sm text-gray-600">Procurement Officer</p>
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

      <main className="p-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search tenders by title, description, sector, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredTenders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? "No tenders found matching your search" : "No tenders found in the history"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tender Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closing Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tender.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {tender.description.substring(0, 100)}
                          {tender.description.length > 100 ? '...' : ''}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {tender.category}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {tender.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(tender.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{tender.bidCount}</span>
                        <span className="text-xs text-gray-500">
                          Total: {formatCurrency(tender.totalBidAmount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(tender.closingDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/procurement-officer/tenders-history/${tender.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}