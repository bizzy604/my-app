'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTenders } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"
import { TenderStatus } from '@prisma/client'
import { Search } from 'lucide-react'
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

export default function TendersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tenders, setTenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        // Only fetch OPEN tenders for vendors
        const data = await getTenders({ status: TenderStatus.OPEN })
        setTenders(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch tenders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTenders()
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

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading tenders...</p>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Available Tenders</h1>
          <p className="text-sm text-gray-600">Browse and bid on available tenders</p>
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
              {searchQuery ? "No tenders found matching your search" : "No tenders available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#4B0082] mb-2">
                    {tender.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tender.description}
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium">{tender.category}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Location</dt>
                      <dd className="font-medium">{tender.location}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Budget</dt>
                      <dd className="font-medium">
                        {formatCurrency(tender.budget)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Sector</dt>
                      <dd className="font-medium">{tender.sector}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-500">Closing Date</dt>
                      <dd className="font-medium">
                        {formatDate(tender.closingDate)}
                      </dd>
                    </div>
                    {tender.requirements && tender.requirements.length > 0 && (
                      <div className="col-span-2">
                        <dt className="text-gray-500 mb-1">Requirements</dt>
                        <dd className="space-y-1">
                          {tender.requirements.map((req: string, index: number) => (
                            <p key={index} className="text-sm text-gray-600">
                              • {req}
                            </p>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      asChild
                    >
                      <Link href={`/vendor/tenders/${tender.id}`}>
                        View Details & Submit Bid
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </VendorLayout>
  )
}