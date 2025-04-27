'use client'

import { useState } from 'react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitSupportTicket } from "@/app/actions/support-actions"

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitSupportTicket(subject, message)
      alert('Support ticket submitted successfully')
      setSubject('')
      setMessage('')
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      alert('Failed to submit support ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 border-b bg-background px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">Support</h1>
            <p className="text-sm text-muted-foreground">Submit a support ticket</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Submit a Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="min-h-[150px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-[#4B0082] hover:bg-[#3B0062] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </VendorLayout>
  )
}