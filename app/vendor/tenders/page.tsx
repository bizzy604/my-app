'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPaginatedTenders } from "@/app/actions/paginated-tender-actions"
import { useToast } from "@/hooks/use-toast"
import { TenderStatus } from '@prisma/client'
import { Search, Filter, MapPin, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"

export default function TendersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tenders, setTenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true)
        const data = await getPaginatedTenders({ 
          status: TenderStatus.OPEN,
          page: currentPage,
          pageSize
        })
        
        setTenders(data.tenders)
        setTotalPages(data.pagination.totalPages)
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
  }, [toast, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredTenders = tenders.filter(tender => 
    tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tender.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <VendorLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary">Available Tenders</h1>
            <p className="text-sm md:text-base text-muted-foreground">Browse and bid on open tender opportunities</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[300px]"
              />
            </div>
            <Button 
              variant="outline" 
              className="md:hidden"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTenders.length > 0 ? (
            filteredTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-primary mb-2">
                        {tender.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tender.description}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{tender.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Closes: {formatDate(tender.closingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: {formatCurrency(tender.budget)}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <Link href={`/vendor/tenders/${tender.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No tenders found
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="mt-6 flex justify-center">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Mobile Filter Panel */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl p-6 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilterOpen(false)}
                >
                  Close
                </Button>
              </div>
              {/* Add filter options here */}
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  )
}