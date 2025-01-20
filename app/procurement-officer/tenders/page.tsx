'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from "next/image"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { getTenders } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"
import { TenderStatus } from '@prisma/client'
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TendersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tenders, setTenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading tenders...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tenders</h1>
          <p className="text-sm text-gray-600">Create and manage tenders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/procurement-officer/tenders/create">
              Create New Tender
            </Link>
          </Button>
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
        </div>
      </header>

      <main className="p-8">
        {tenders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No tenders yet</h3>
            <p className="text-sm text-gray-600 mt-1">Get started by creating your first tender</p>
            <Button className="mt-4" asChild>
              <Link href="/procurement-officer/tenders/create">
                Create New Tender
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tenders.map((tender) => (
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
                      <dt className="text-gray-500">Status</dt>
                      <dd className="font-medium">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tender.status === TenderStatus.OPEN
                            ? 'bg-green-100 text-green-800'
                            : tender.status === TenderStatus.CLOSED
                            ? 'bg-red-100 text-red-800'
                            : tender.status === TenderStatus.AWARDED
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tender.status}
                        </span>
                      </dd>
                    </div>
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
                      <dd className="font-medium">{formatCurrency(tender.budget)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-500">Closing Date</dt>
                      <dd className="font-medium">{formatDate(tender.closingDate)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/procurement-officer/tenders/${tender.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}