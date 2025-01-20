'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MapPin, Calendar, Building2 } from 'lucide-react'
import { getTenders } from "@/app/actions/tender-actions"
import { TenderStatus } from '@prisma/client'

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

export default function CitizenTendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const router = useRouter()

  useEffect(() => {
    getTenders({ status: TenderStatus.OPEN }).then((fetchedTenders) => {
      const transformedTenders: Tender[] = fetchedTenders.map(tender => ({
        ...tender,
        closingDate: new Date(tender.closingDate),
        // Provide default values for optional fields
        awardedTo: null,
        amount: null,
        awardDate: null
      }));
      setTenders(transformedTenders);
    })
  }, [])

  return (
    <CitizenLayout>
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-2xl font-semibold text-[#4B0082]">Available Tenders</h1>
        <p className="text-sm text-gray-600">View all current tender opportunities</p>
      </header>

      <main className="p-8">
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
                    {tender.issuer.name} ({tender.issuer.company || 'No company'})</div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Location: </span>
                    {tender.location}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Closing Date: </span>
                    {tender.closingDate.toLocaleDateString()}</div>
                </div>
                <Button 
                  onClick={() => router.push(`/tenders/${tender.id}`)} 
                  className="mt-4 w-full"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </CitizenLayout>
  )
}