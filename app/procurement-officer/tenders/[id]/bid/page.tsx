'use client'

import { useState } from 'react'
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from 'lucide-react'

export default function BidPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting bid:', error)
    }
  }

  if (isSuccess) {
    return <BidSuccessPage />
  }

  if (isSubmitting) {
    return (
      <DashboardLayout>
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16 animate-spin">
              <svg
                className="absolute inset-0"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-gray-200"
                />
                <path
                  d="M50 5A45 45 0 0 1 95 50"
                  stroke="#4B0082"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-900">
              Your bid&apos;s proposed price is being assessed by our models,
            </p>
            <p className="text-sm text-gray-600">please give us a moment</p>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Submit Bid</h1>
          <p className="text-sm text-gray-600">Complete the form below to submit your bid</p>
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
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Bid Submission Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bidAmount">Bid Amount (ZAR)</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        placeholder="Enter bid amount"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="completionTime">Estimated Completion Time</Label>
                      <Select>
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
                      placeholder="Describe your technical approach and methodology"
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Relevant Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your relevant experience and past projects"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Supporting Documents</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="proposal" className="text-sm text-gray-600">Technical Proposal Document</Label>
                        <Input id="proposal" type="file" accept=".pdf,.doc,.docx" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="financial" className="text-sm text-gray-600">Financial Proposal</Label>
                        <Input id="financial" type="file" accept=".pdf,.xls,.xlsx" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration" className="text-sm text-gray-600">Company Registration</Label>
                        <Input id="registration" type="file" accept=".pdf" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax" className="text-sm text-gray-600">Tax Clearance Certificate</Label>
                        <Input id="tax" type="file" accept=".pdf" required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms and Conditions</Label>
                    <div className="rounded-lg border p-4 text-sm text-gray-600">
                      <p>By submitting this bid, you confirm that:</p>
                      <ul className="ml-4 mt-2 list-disc space-y-1">
                        <li>All information provided is accurate and truthful</li>
                        <li>You have read and understood the tender requirements</li>
                        <li>You agree to the tender terms and conditions</li>
                        <li>You have the authority to submit this bid on behalf of your organization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="bg-[#4B0082] hover:bg-[#3B0062]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                  </Button>
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}

function BidSuccessPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <div className="relative">
              <Check className="absolute -left-4 h-8 w-8 rotate-45 transform text-green-500" />
              <Check className="absolute -right-4 h-8 w-8 -rotate-45 transform text-green-500" />
            </div>
          </div>
          <h2 className="mb-2 text-sm font-medium text-green-500">Bid Pricing in Range!</h2>
          <p className="text-xl font-semibold text-gray-900">Your bid has been posted</p>
        </div>
      </main>
    </DashboardLayout>
  )
}

