'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { createTender } from "@/app/actions/tender-actions"
import { useToast } from "@/hooks/use-toast"

export default function CreateTenderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a tender",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData(event.currentTarget)
      const tenderData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        sector: formData.get('sector') as string,
        category: formData.get('category') as string,
        location: formData.get('location') as string,
        budget: parseFloat(formData.get('budget') as string),
        closingDate: formData.get('closingDate') as string,
        requirements: (formData.get('requirements') as string).split('\n').filter(req => req.trim() !== ''),
        issuerId: parseInt(session.user.id, 10),
      }

      console.log('Creating tender with data:', tenderData)
      const tender = await createTender(tenderData)
      console.log('Created tender:', tender)

      toast({
        title: "Success",
        description: "Tender created successfully",
      })

      router.push('/procurement-officer/tenders')
    } catch (error: any) {
      console.error('Failed to create tender:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create tender",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Tender</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter tender title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter tender description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Select name="sector" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSTRUCTION">Construction</SelectItem>
                        <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                        <SelectItem value="SERVICES">Services</SelectItem>
                        <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                        <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                        <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                        <SelectItem value="EDUCATION">Education</SelectItem>
                        <SelectItem value="ENERGY">Energy</SelectItem>
                        <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOODS">Goods</SelectItem>
                        <SelectItem value="SERVICES">Services</SelectItem>
                        <SelectItem value="WORKS">Works</SelectItem>
                        <SelectItem value="CONSULTING">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Enter location"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter budget amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="closingDate">Closing Date</Label>
                  <Input
                    id="closingDate"
                    name="closingDate"
                    type="datetime-local"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Enter each requirement on a new line"
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/procurement-officer/tenders')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Tender'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}