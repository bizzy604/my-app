'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TenderCard } from "@/components/tender-card"
import { getTenders } from "@/app/actions/tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"

export default function TendersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: tenders = [], isLoading } = useHydrationSafeClient(() => getTenders())

  const handleEdit = (tenderId: string) => {
    router.push(`/procurement-officer/tenders/${tenderId}/edit`)
  }

  const handleDelete = (tenderId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete tender:', tenderId)
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Active Tenders</h1>
            <p className="text-sm md:text-base text-gray-600">Manage and monitor ongoing tenders</p>
          </div>
          <Button
            onClick={() => router.push('/procurement-officer/tenders/create')}
            className="bg-[#4B0082] hover:bg-purple-700 text-white w-full md:w-auto"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Create New Tender</span>
            <span className="md:hidden">New Tender</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm md:text-base w-full"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
          </Select>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-[200px] bg-gray-100 rounded-lg animate-pulse"
              />
            ))
          ) : tenders.length > 0 ? (
            tenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                onEdit={() => handleEdit(tender.id)}
                onDelete={() => handleDelete(tender.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No tenders found
            </div>
          )}
        </div>

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
    </DashboardLayout>
  )
} 