'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Building2, 
  DollarSign,
  AlertTriangle,
  Clock,
  Users,
  FileCheck,
  ArrowLeft
} from 'lucide-react'
import { getTenderById } from "@/app/actions/tender-actions"
import { LoadingSpinner } from "@/components/loading-spinner"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TenderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tender, setTender] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const data = await getTenderById(params.id)
        setTender(data)
      } catch (error) {
        console.error('Error fetching tender:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTender()
  }, [params.id])

  if (loading) {
    return (
      <CitizenLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </CitizenLayout>
    )
  }

  if (!tender) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-bold text-destructive">Tender Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </CitizenLayout>
    )
  }

  return (
    <CitizenLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                      {tender.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Reference: {tender.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <Badge variant={tender.status === 'OPEN' ? 'default' : 'secondary'}>
                    {tender.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="text-lg font-semibold">Description</h3>
                      <p className="text-muted-foreground">{tender.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-sm text-muted-foreground">{tender.department?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{tender.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(tender.budget)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">{tender.duration}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="requirements">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Technical Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {tender.requirements?.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Supporting Documents</h3>
                      {tender.documents?.length > 0 ? (
                        <div className="space-y-2">
                          {tender.documents.map((doc: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{doc.title}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents available</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="text-sm font-medium">
                    {formatDate(tender.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Closing Date</span>
                  <span className="text-sm font-medium">
                    {formatDate(tender.closingDate)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bid Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Bids</span>
                  <span className="text-sm font-medium">{tender.bids?.length || 0}</span>
                </div>
                {tender.status === 'AWARDED' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Awarded Amount</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(tender.awardedBid?.amount)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => router.push(`/citizen/report?tenderId=${tender.id}`)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Irregularity
            </Button>
          </div>
        </div>
      </div>
    </CitizenLayout>
  )
}