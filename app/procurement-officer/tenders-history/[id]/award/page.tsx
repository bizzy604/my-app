'use client'

import { useState, useEffect } from 'react'
import { Mail, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import { getBidById, updateBidStatus } from "@/app/actions/tender-actions"
import { sendAwardNotification } from "@/app/actions/tender-actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { BidStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma';

interface BidderInfo {
  name: string
  email: string
  company: string
  bidAmount: number
}

export default function AwardTenderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bidId = searchParams.get('bidId')
  const { data: session } = useSession()
  const { toast } = useToast()

  const [bid, setBid] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadBidData = async () => {
      try {
        if (!bidId) {
          // If no bid ID is provided, try to find the most recent bid for the tender
          const bids = await prisma.bid.findMany({
            where: { 
              tenderId: params.id,
              status: BidStatus.PENDING 
            },
            orderBy: { submissionDate: 'desc' },
            take: 1,
            include: {
              tender: true,
              bidder: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  company: true,
                }
              },
              documents: true
            }
          })

          if (bids.length === 0) {
            throw new Error('No pending bids found for this tender')
          }

          const bidData = bids[0]
          setBid(bidData)

          // Set default message
          setMessage(`Congratulations on getting this tender, looking forward to working with you. Your bid of ${formatCurrency(bidData.amount)} has been accepted.`)
        } else {
          // If bid ID is provided, fetch that specific bid
          const bidData = await getBidById(bidId)
          setBid(bidData)

          // Set default message
          setMessage(`Congratulations on getting this tender, looking forward to working with you. Your bid of ${formatCurrency(bidData.amount)} has been accepted.`)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load bid details",
          variant: "destructive",
        })
        router.push('/procurement-officer/tenders-history')
      }
    }

    loadBidData()
  }, [bidId, params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement actual email sending logic
      await sendAwardNotification({
        bidId: bid.id,
        message,
        recipientEmail: bid.bidder.email,
        recipientName: bid.bidder.name,
      })

      // Update bid status to ACCEPTED
      await updateBidStatus(bid.id, BidStatus.ACCEPTED, bid.tenderId)

      setIsSuccess(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send award notification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!bid) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
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
                    <p className="text-sm font-medium">{bid.bidder.email}</p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Winning Bidder
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{bid.bidder.company}</p>
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
                      <dd className="col-span-2 text-sm font-medium">{bid.bidder.name}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Company:</dt>
                      <dd className="col-span-2 text-sm font-medium">{bid.bidder.company}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Email:</dt>
                      <dd className="col-span-2 text-sm font-medium">{bid.bidder.email}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm text-gray-500">Bid Amount:</dt>
                      <dd className="col-span-2 text-sm font-medium">
                        {formatCurrency(bid.amount)}
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