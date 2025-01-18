'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Building2, DollarSign, Calendar } from 'lucide-react'
import { getTenders } from "@/app/actions/tender-actions"

interface Tender {
  id: string;
  title: string;
  sector: string;
  location: string;
  issuer: string;
  description: string;
  closingDate: string;
  status: string;
  awardedTo: string;
  amount: number;
  awardDate: string;
}

export default function CitizenAwardedTendersPage() {
  const [awardedTenders, setAwardedTenders] = useState<Tender[]>([]);
  const router = useRouter()

  useEffect(() => {
    getTenders().then(tenders => setAwardedTenders(tenders.filter(t => t.status === 'awarded')))
  }, [])

  return (
    <CitizenLayout>
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-2xl font-semibold text-[#4B0082]">Awarded Tenders</h1>
        <p className="text-sm text-gray-600">View details of recently awarded tenders</p>
      </header>

      <main className="p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {awardedTenders.map((tender) => (
            <Card key={tender.id}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-[#4B0082]" />
                  <span>{tender.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Awarded to: </span>
                    {tender.awardedTo}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Amount: </span>
                    Rs. {tender.amount?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Award Date: </span>
                    {new Date(tender.awardDate).toLocaleDateString()}
                  </div>
                </div>
                <Button 
                  className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]"
                  onClick={() => router.push(`/citizen/awarded-tenders/${tender.id}`)}
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