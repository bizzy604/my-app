'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { deleteTender } from "@/app/actions/tender-actions"
import { getPaginatedTenders } from "@/app/actions/paginated-tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { Pagination } from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define the tender interface to match the TenderCard component's expectations
interface SimplifiedTender {
  id: string
  title: string
  description: string
  sector: string
  location: string
  issuer: string
  status: string
  budget: number
  closingDate: string
}

export default function TendersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isDeleting, setIsDeleting] = useState(false)
  const [tenderToDelete, setTenderToDelete] = useState<string | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [statusMessage, setStatusMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const { data: tendersData = { tenders: [], pagination: { totalPages: 1, currentPage: 1 } }, isLoading } = useHydrationSafeClient(
    () => getPaginatedTenders({ page: currentPage, pageSize }),
    [refreshKey, currentPage, pageSize]
  )

  // Simplify the tender data to match the TenderCard component's expectations
  const tenders: SimplifiedTender[] = Array.isArray(tendersData?.tenders) ? tendersData.tenders.map(tender => ({
    id: tender.id,
    title: tender.title,
    description: tender.description,
    sector: tender.sector,
    location: tender.location,
    issuer: typeof tender.issuer === 'object' ? tender.issuer.name : tender.issuer,
    status: tender.status,
    budget: tender.budget,
    closingDate: tender.closingDate.toString()
  })) : [];

  // Debug logging - remove in production
  console.log('Pagination info:', {
    currentPage,
    totalPages: tendersData?.pagination?.totalPages,
    hasMultiplePages: tendersData?.pagination?.totalPages > 1,
    tenderCount: tenders.length
  });

  const handleEdit = (tenderId: string) => {
    router.push(`/procurement-officer/tenders/${tenderId}/edit`)
  }

  const handleDelete = (tenderId: string) => {
    setTenderToDelete(tenderId)
    setIsAlertOpen(true)
  }

  const confirmDelete = async () => {
    if (!tenderToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteTender(tenderToDelete)
      setStatusMessage({
        message: "Tender has been successfully deleted.",
        type: "success"
      })
      // Trigger a refresh by incrementing the key
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting tender:', error)
      setStatusMessage({
        message: "Failed to delete tender. Please try again.",
        type: "error"
      })
    } finally {
      setIsDeleting(false)
      setTenderToDelete(null)
      setIsAlertOpen(false)
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Status Message */}
        {statusMessage && (
          <div className={`p-4 rounded-md ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {statusMessage.message}
          </div>
        )}
      
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary">Active Tenders</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage and monitor ongoing tenders</p>
          </div>
          <Button
            onClick={() => router.push('/procurement-officer/tenders/create')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Create New Tender</span>
            <span className="md:hidden">New Tender</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm md:text-base w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm md:text-base w-full"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
          </select>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-[200px] bg-muted rounded-lg animate-pulse"
              />
            ))
          ) : tenders && tenders.length > 0 ? (
            tenders.map((tender) => (
              <div key={tender.id} className="tender-card-wrapper">
                {/* Import TenderCard at the component level to avoid circular type issues */}
                {(() => {
                  const { TenderCard } = require("@/components/tender-card");
                  return (
                    <TenderCard
                      tender={tender}
                      onEdit={() => handleEdit(tender.id)}
                      onDelete={() => handleDelete(tender.id)}
                    />
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No tenders found
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={tendersData?.pagination?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 md:hidden shadow-lg"
          onClick={() => {/* TODO: Implement mobile filters */}}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this tender? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}