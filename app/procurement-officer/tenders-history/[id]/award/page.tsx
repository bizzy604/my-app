'use client'

import { useState } from 'react'
import { Mail, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BidderInfo {
  name: string
  email: string
  company: string
  bidAmount: number
}

// This would normally come from your API/database
const getBidderInfo = (id: string): BidderInfo => ({
  name: "John Smith",
  email: "blackblock@gmail.com",
  company: "Nelson Mandela University Business School",
  bidAmount: 16789123
})

export default function AwardTenderPage({ params }: { params: { id: string } }) {
  const bidder = getBidderInfo(params.id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState(
    `Congratulations on getting this tender, looking forward to working with you. Your bid of Rs. ${bidder.bidAmount.toLocaleString()} has been accepted.`
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to award tender and send notification
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (error) {
      console.error('Error awarding tender:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <div className="relative">
                <div className="rounded-full bg-purple-100 p-3">
                  <Mail className="h-8 w-8 text-[#4B0082]" />
                </div>
                <div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your messages have been sent!</h2>
            <div className="rounded-lg bg-gray-50 p-4 text-left">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Recipient(s):</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{bidder.email}</p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Winning Bidder
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{bidder.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            </div>
            <Button 
              asChild
              className="mt-4 bg-[#4B0082] hover:bg-[#3B0062]"
            >
              <Link href="/procurement-officer/tenders-history">
                Return to Tender History
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/procurement-officer/tenders-history/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#4B0082]">Award Tender</h1>
            <p className="text-sm text-gray-600">Send award notification to the winning bidder</p>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Award Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="font-medium text-gray-900">Winning Bidder Details</h3>
                  <dl className="mt-3 space-y-1">
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Name:</dt>
                      <dd className="col-span-2 text-sm font-medium">{bidder.name}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Company:</dt>
                      <dd className="col-span-2 text-sm font-medium">{bidder.company}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Email:</dt>
                      <dd className="col-span-2 text-sm font-medium">{bidder.email}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Bid Amount:</dt>
                      <dd className="col-span-2 text-sm font-medium">
                        KES. {bidder.bidAmount.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Award Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    This message will be sent to the winning bidder along with the official award notification.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="bg-[#4B0082] hover:bg-[#3B0062]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending Award...' : 'Award Tender'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    asChild
                  >
                    <Link href={`/procurement-officer/tenders-history/${params.id}`}>
                      Cancel
                    </Link>
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