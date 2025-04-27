"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { getTenders } from "@/app/actions/tender-actions"
import { TenderStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Building2, DollarSign, Calendar } from 'lucide-react'
import { LoadingSpinner } from "@/components/loading-spinner"

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

export default function CitizenAwardedTendersPage() {
  const [awardedTenders, setAwardedTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    getTenders({ status: TenderStatus.AWARDED }).then((tenders) => {
      const transformedTenders: Tender[] = tenders.map(tender => ({
        ...tender,
        closingDate: new Date(tender.closingDate),
        awardDate: tender.bids && tender.bids.length > 0 
          ? new Date(tender.bids[tender.bids.length - 1].submissionDate) 
          : null,
        amount: tender.bids && tender.bids.length > 0 
          ? tender.bids[tender.bids.length - 1].amount 
          : null
      }))
      setAwardedTenders(transformedTenders)
      setLoading(false)
    })
  }, [])

  return (
    <CitizenLayout>
      <header className="border-b bg-background px-4 sm:px-8 py-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-primary">Awarded Tenders</h1>
        <p className="text-sm text-muted-foreground">View details of recently awarded tenders</p>
      </header>

      <main className="p-4 sm:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner className="h-8 w-8 mb-4" />
            <p className="text-muted-foreground">Loading awarded tenders...</p>
          </div>
        ) : awardedTenders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Award className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Awarded Tenders</h3>
            <p className="text-muted-foreground mt-2">There are no awarded tenders to display.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {awardedTenders.map((tender) => (
              <Card key={tender.id}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>{tender.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Issuer: </span>
                      {tender.issuer.name} ({tender.issuer.company || 'No company'})</div>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Amount: </span>
                      {tender.amount !== null && tender.amount !== undefined 
                        ? `Rs. ${tender.amount.toLocaleString()}` 
                        : 'Not specified'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Award Date: </span>
                      {tender.awardDate 
                        ? tender.awardDate.toLocaleDateString() 
                        : 'Not specified'}
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