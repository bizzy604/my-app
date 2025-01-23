'use client'

import React, { useState, useEffect, use, useMemo } from 'react'
import { Mail, Check } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBidById } from "@/app/actions/tender-actions"
import { formatCurrency } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'
import { sendAwardNotification } from "@/app/actions/tender-actions"

export default function MessagePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [bidWinnerDetails, setBidWinnerDetails] = useState<any>(null)

  useEffect(() => {
    async function fetchBidDetails() {
      try {
        const bidId = searchParams.get('bidId')
        
        if (!bidId) {
          throw new Error('No bid ID provided')
        }

        // Fetch the specific bid details
        const bidDetails = await getBidById(bidId)
        
        if (bidDetails) {
          setBidWinnerDetails(bidDetails)
          setRecipient(bidDetails.bidder.email)
          setMessage(`Congratulations on winning the tender "${bidDetails.tender.title}" with a bid of ${formatCurrency(bidDetails.amount)}. We look forward to working with you.`)
        }
      } catch (error) {
        console.error('Error fetching bid details:', error)
      }
    }

    fetchBidDetails()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use server action to send award notification
      await sendAwardNotification({
        bidId: bidWinnerDetails.id,
        message,
        recipientEmail: recipient,
        recipientName: bidWinnerDetails.bidder.name
      })
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Error sending message:', error)
      // Add toast or error handling
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <DashboardLayout>
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
              <h2 className="text-xl font-semibold text-gray-900">Your message has been sent!</h2>
              <div className="rounded-lg bg-gray-50 p-4 text-left">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Recipient(s):</p>
                    <p className="text-sm font-medium">{recipient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Message</p>
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Send Message to Bid Winner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-[#4B0082] hover:bg-[#3B0062]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
