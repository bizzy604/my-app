'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DocumentManager } from "@/components/document-manager"
import { useToast } from "@/hooks/use-toast"
import { createTender } from "@/app/actions/tender-actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TenderCategory, TenderSector } from "@prisma/client"

interface CreateTender {
  title: string
  description: string
  sector: TenderSector
  location: string
  budget: number
  closingDate: string
  category: TenderCategory
  requirements: string[]
  issuerId: number
  status: string
}

export default function CreateTenderPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (status !== 'authenticated' || !session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a tender",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const tenderData: CreateTender = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        sector: formData.get('sector') as TenderSector,
        location: formData.get('location') as string,
        budget: Number(formData.get('budget')),
        closingDate: formData.get('closingDate') as string,
        category: formData.get('category') as TenderCategory,
        requirements: (formData.get('requirements') as string)
          .split('\n')
          .filter(req => req.trim()),
        issuerId: Number(session.user.id),
        status: 'OPEN'
      }

      await createTender(tenderData)
      router.push('/procurement-officer/tenders')
      toast({
        title: "Success",
        description: "Tender created successfully",
      })
    } catch (error) {
      console.error('Error creating tender:', error)
      toast({
        title: "Error",
        description: "Failed to create tender. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary">Create New Tender</h1>
            <p className="text-sm md:text-base text-muted-foreground">Fill in the details to create a new tender</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tender Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter tender title"
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <select
                id="sector"
                name="sector"
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a sector</option>
                {Object.values(TenderSector).map((sector) => (
                  <option key={sector} value={sector}>
                    {sector.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                required
                placeholder="Enter location"
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Enter budget"
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a category</option>
                {Object.values(TenderCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing Date and Time</Label>
              <Input
                id="closingDate"
                name="closingDate"
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Enter tender description"
              rows={4}
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              required
              placeholder="Enter requirements"
              rows={4}
              className="text-sm md:text-base"
            />
          </div>

          {session?.user?.id && (
            <div className="space-y-2">
              <Label>Documents</Label>
              <DocumentManager 
                tenderId="new" 
                userId={session.user.id.toString()}
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="text-sm md:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base"
            >
              {isSubmitting ? 'Creating...' : 'Create Tender'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 