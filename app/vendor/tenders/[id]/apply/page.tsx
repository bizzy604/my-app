'use client'

import React, { Suspense, useEffect, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  useHydrationSafeClient, 
  HydrationSafeLoader, 
  safeSessionData 
} from "@/components/hydration-safe-client-component"
import { 
  getTenderById, 
  submitBid 
} from "@/app/actions/tender-actions"
import { formatCurrency } from "@/lib/utils"

function TenderApplicationContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [submitting, setSubmitting] = React.useState(false)
  const [applicationData, setApplicationData] = React.useState({
    amount: '',
    completionTime: '',
    technicalProposal: '',
    experience: '',
    documents: [] as File[],
  })

  useEffect(() => {
    console.log('Session Status:', status)
    console.log('Session Data:', session)
  }, [status, session])

  const { 
    data: tenderData, 
    isLoading, 
    isClient 
  } = useHydrationSafeClient(
    async () => {
      try {
        return await getTenderById(id)
      } catch (error) {
        console.error('Error loading tender:', error)
        toast({
          title: "Error",
          description: "Failed to load tender details",
          variant: "destructive",
        })
        router.push('/vendor/tenders')
        return null
      }
    },
    [id]
  )

  const safeUser = useMemo(() => {
    if (status === 'authenticated' && session?.user) {
      return {
        id: parseInt(session.user.id.toString(), 10),
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    }
    return { id: null, email: null, name: null, role: null }
  }, [session, status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setApplicationData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setApplicationData(prev => ({
        ...prev,
        documents: [
          ...(prev.documents || []), 
          ...Array.from(files)
        ]
      }))
    }
  }

  const removeDocument = (indexToRemove: number) => {
    setApplicationData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== 'authenticated' || !safeUser.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application. Please log in and try again.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    if (!applicationData.amount || !applicationData.completionTime || !applicationData.technicalProposal) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const bidSubmission = {
        tenderId: id,
        bidderId: safeUser.id,
        amount: parseFloat(applicationData.amount),
        completionTime: applicationData.completionTime,
        technicalProposal: applicationData.technicalProposal,
        experience: applicationData.experience,
        documents: applicationData.documents,
      }

      await submitBid(bidSubmission)

      toast({
        title: "Success",
        description: "Your tender application has been submitted successfully",
      })
      
      router.push('/vendor/tenders-history')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit tender application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <VendorLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6 text-center">
            You must be logged in to submit a tender application.
          </p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </VendorLayout>
    )
  }

  return (
    <HydrationSafeLoader 
      isLoading={isLoading} 
      isClient={isClient}
      fallback={
        <VendorLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading tender application...</p>
          </div>
        </VendorLayout>
      }
    >
      {tenderData && (
        <VendorLayout>
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Application</h1>
              <p className="text-sm text-gray-600">Submit your application for {tenderData.title}</p>
            </div>
          </header>

          <main className="p-8">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Tender Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Bid Amount</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="Enter your bid amount"
                        value={applicationData.amount}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-sm text-gray-500">
                        Tender Budget: {formatCurrency(tenderData.budget)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="completionTime">Estimated Completion Time</Label>
                      <Select 
                        name="completionTime"
                        onValueChange={(value) => 
                          setApplicationData(prev => ({ 
                            ...prev, 
                            completionTime: value 
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="12-months">12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalProposal">Technical Proposal</Label>
                    <Textarea
                      id="technicalProposal"
                      name="technicalProposal"
                      placeholder="Describe your technical approach and methodology"
                      value={applicationData.technicalProposal}
                      onChange={handleInputChange}
                      className="min-h-[200px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Relevant Experience</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      placeholder="Describe your relevant experience and past projects"
                      value={applicationData.experience}
                      onChange={handleInputChange}
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Supporting Documents</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="proposal" className="text-sm text-gray-600">
                          Technical Proposal Document
                        </Label>
                        <Input 
                          id="proposal" 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="financial" className="text-sm text-gray-600">
                          Financial Proposal
                        </Label>
                        <Input 
                          id="financial" 
                          type="file" 
                          accept=".pdf,.xls,.xlsx" 
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration" className="text-sm text-gray-600">
                          Company Registration
                        </Label>
                        <Input 
                          id="registration" 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax" className="text-sm text-gray-600">
                          Tax Clearance Certificate
                        </Label>
                        <Input 
                          id="tax" 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                    </div>
                    {applicationData.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Uploaded Documents:</p>
                        <ul className="text-sm text-gray-600">
                          {applicationData.documents.map((doc, index) => (
                            <li key={index}>
                              {doc.name}
                              <Button 
                                type="button" 
                                variant="link" 
                                onClick={() => removeDocument(index)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms and Conditions</Label>
                    <div className="rounded-lg border p-4 text-sm text-gray-600">
                      <p>By submitting this application, you confirm that:</p>
                      <ul className="ml-4 mt-2 list-disc space-y-1">
                        <li>All information provided is accurate and truthful</li>
                        <li>You have read and understood the tender requirements</li>
                        <li>You agree to the tender terms and conditions</li>
                        <li>You have the authority to submit this application on behalf of your organization</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="bg-[#4B0082] text-white hover:bg-[#3B0062]"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => router.push(`/vendor/tenders/${id}`)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </VendorLayout>
      )}
    </HydrationSafeLoader>
  )
}

export default function TenderApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenderApplicationContent id={resolvedParams.id} />
    </Suspense>
  )
}
