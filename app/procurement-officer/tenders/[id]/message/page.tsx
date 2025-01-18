'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MessagePage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recipient, setRecipient] = useState('blackblock@gmail.com')
  const [message, setMessage] = useState(
    'Congratulations on getting this tender, looking forward to working with you'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (error) {
      console.error('Error sending message:', error)
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
    )
  }

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Send Message to Winner</CardTitle>
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
