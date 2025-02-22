'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MapPin, Calendar, Building2 } from 'lucide-react'
import { getTenders } from "@/app/actions/tender-actions"
import { TenderStatus } from '@prisma/client'
import { LoadingSpinner } from "@/components/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"

type Tender = {
  id: string;
  title: string;
  sector: string;
  location: string;
  description: string;
  closingDate: Date;
  status: TenderStatus;
  awardedTo?: string | null;
  amount?: number | null;
  awardDate?: Date | null;
  issuer: {
    id: number;
    name: string;
    company: string | null;
  };
  bids: Array<{
    id: string;
    status: string;
    amount: number;
    submissionDate: Date;
    evaluationScore: number | null;
  }>;
}

function TenderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-[200px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function CitizenTendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    getTenders({ status: TenderStatus.OPEN }).then((fetchedTenders) => {
      const transformedTenders: Tender[] = fetchedTenders.map(tender => ({
        ...tender,
        closingDate: new Date(tender.closingDate),
        awardedTo: null,
        amount: null,
        awardDate: null
      }))
      setTenders(transformedTenders)
      setLoading(false)
    })
  }, [])

  return (
    <CitizenLayout>
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-2xl font-semibold text-[#4B0082]">Available Tenders</h1>
        <p className="text-sm text-gray-600">View all current tender opportunities</p>
      </header>

      <main className="p-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <TenderCardSkeleton key={index} />
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Tenders</h3>
            <p className="text-gray-500 mt-2">There are currently no open tenders available.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tenders.map((tender) => (
              <Card key={tender.id}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-[#4B0082]" />
                    <span>{tender.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Issuer: </span>
                      {tender.issuer.name} ({tender.issuer.company || 'No company'})
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Location: </span>
                      {tender.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Closing Date: </span>
                      {new Date(tender.closingDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push(`/citizen/tenders/${tender.id}`)}
                    className="mt-4 w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </CitizenLayout>
  )
}