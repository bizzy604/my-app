'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  HelpCircle, 
  FileText, 
  MessageCircle,
  ExternalLink,
  Send
} from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { submitSupportTicket } from "@/app/actions/support-actions"

export default function SupportPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const ticketData = {
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
        userId: session?.user?.id
      }

      await submitSupportTicket(ticketData)
      
      toast({
        title: 'Success',
        description: 'Support ticket submitted successfully',
        variant: 'default'
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit support ticket',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Help & Support</h1>
          <p className="text-sm md:text-base text-gray-600">Get assistance and access resources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <HelpCircle className="h-5 w-5" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="/docs/user-guide.pdf" 
                target="_blank"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">User Guide</p>
                    <p className="text-sm text-gray-500">Download the complete user manual</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>

              <a 
                href="/docs/faq.pdf" 
                target="_blank"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">FAQs</p>
                    <p className="text-sm text-gray-500">Frequently asked questions</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="Brief description of your issue"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Describe your issue in detail"
                    rows={4}
                    className="text-sm md:text-base resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#4B0082] hover:bg-purple-700 text-white"
                >
                  <Send className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Submit Ticket</span>
                  <span className="md:hidden">Submit</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 