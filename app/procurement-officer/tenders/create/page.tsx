'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createTender } from "@/app/actions/tender-actions"

export default function CreateTenderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const tenderData = {
      title: formData.get('title') as string,
      sector: formData.get('sector') as string,
      location: formData.get('location') as string,
      issuer: formData.get('issuer') as string,
      description: formData.get('description') as string,
      closingDate: formData.get('closingDate') as string,
    }

    try {
      await createTender(tenderData)
      router.push('/procument-officer/tenders')
    } catch (error) {
      console.error('Failed to create tender:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#4B0082]">Create New Tender</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tender Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input id="sector" name="sector" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input id="issuer" name="issuer" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input id="closingDate" name="closingDate" type="datetime-local" required />
              </div>
              <Button 
                type="submit" 
                className="bg-[#4B0082] hover:bg-[#3B0062]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Tender'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}