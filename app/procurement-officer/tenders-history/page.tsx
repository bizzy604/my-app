'use client'

import { useState } from 'react'
import Image from "next/image"
import { ArrowUpDown, MoreHorizontal, ThumbsUp, ThumbsDown, Clock, Building2 } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Bid {
  id: string
  applicant: string
  proposedPrice: number
  status: 'approved' | 'rejected' | 'pending'
  profileImage: string
}

const bids: Bid[] = [
  {
    id: '1',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'approved',
    profileImage: '/placeholder.svg'
  },
  {
    id: '2',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'rejected',
    profileImage: '/placeholder.svg'
  },
  {
    id: '3',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'pending',
    profileImage: '/placeholder.svg'
  },
  {
    id: '4',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'approved',
    profileImage: '/placeholder.svg'
  },
  {
    id: '5',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'pending',
    profileImage: '/placeholder.svg'
  },
  {
    id: '6',
    applicant: 'Nelson Mandela University Business School',
    proposedPrice: 16789123,
    status: 'rejected',
    profileImage: '/placeholder.svg'
  },
]

export default function TendersHistoryPage() {
  const [selectedBids, setSelectedBids] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBids(new Set())
    } else {
      setSelectedBids(new Set(bids.map(bid => bid.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectBid = (bidId: string) => {
    const newSelected = new Set(selectedBids)
    if (newSelected.has(bidId)) {
      newSelected.delete(bidId)
    } else {
      newSelected.add(bidId)
    }
    setSelectedBids(newSelected)
    setSelectAll(newSelected.size === bids.length)
  }

  const handleAcceptSelected = () => {
    // Implement accept logic here
    console.log('Accepting bids:', Array.from(selectedBids))
  }

  const handleRejectSelected = () => {
    // Implement reject logic here
    console.log('Rejecting bids:', Array.from(selectedBids))
  }

  const getStatusIcon = (status: Bid['status']) => {
    switch (status) {
      case 'approved':
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tenders</h1>
          <p className="text-sm text-gray-600">View all tender offers made for tenders here</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">John Mwangi</p>
            <p className="text-sm text-gray-600">Procurement Officer, Ministry of Finance</p>
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
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="border-b bg-gray-50/50 px-4 py-3">
              <h2 className="text-lg font-semibold text-[#4B0082]">
                Provision of Short-Term Insurance Brokerage Services
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        Proposed Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Flag
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr 
                      key={bid.id} 
                      className="border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => window.location.href = `/procurement-officer/tenders-history/${bid.id}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedBids.has(bid.id)}
                          onCheckedChange={() => handleSelectBid(bid.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-600" />
                          </div>
                          <span className="text-sm">{bid.applicant}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">Rs. {bid.proposedPrice.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusIcon(bid.status)}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Accept bid</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Reject bid
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptSelected}
              disabled={selectedBids.size === 0}
              className="bg-purple-100 text-[#4B0082] hover:bg-purple-200"
            >
              Accept Selected
            </Button>
            <Button
              onClick={handleRejectSelected}
              disabled={selectedBids.size === 0}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Reject Selected
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}