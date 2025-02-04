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
import { getTenderById, updateTender } from "@/app/actions/tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TenderSector } from "@prisma/client"

export default function EditTenderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tender, isLoading } = useHydrationSafeClient(() => getTenderById(params.id))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const closingDate = formData.get('closingDate')
      
      // Ensure closingDate has seconds and timezone
      const formattedDate = closingDate 
        ? new Date(closingDate.toString()).toISOString()
        : undefined

      const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        sector: formData.get('sector') as TenderSector,
        location: formData.get('location') as string,
        budget: Number(formData.get('budget')),
        closingDate: formattedDate,
        category: formData.get('category') as string,
        requirements: (formData.get('requirements') as string)
          .split('\n')
          .filter(req => req.trim())
      }

      await updateTender(params.id, data)
      
      toast({
        title: "Success",
        description: "Tender updated successfully",
      })
      
      router.push('/procurement-officer/tenders')
    } catch (error) {
      console.error('Error updating tender:', error)
      toast({
        title: "Error",
        description: "Failed to update tender",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!tender) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 text-center">
          <p className="text-red-500">Tender not found</p>
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
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Edit Tender</h1>
            <p className="text-sm md:text-base text-gray-600">Update tender details</p>
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
                defaultValue={tender.title}
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <select
                id="sector"
                name="sector"
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                defaultValue={tender.location}
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
                defaultValue={tender.budget}
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                required
                defaultValue={tender.category}
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input
                id="closingDate"
                name="closingDate"
                type="datetime-local"
                required
                defaultValue={tender.closingDate}
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
              defaultValue={tender.description}
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
              defaultValue={tender.requirements.join('\n')}
              rows={4}
              className="text-sm md:text-base"
            />
          </div>

          {session?.user?.id && (
            <div className="space-y-2">
              <Label>Documents</Label>
              <DocumentManager 
                tenderId={params.id}
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
              className="bg-[#4B0082] hover:bg-purple-700 text-white text-sm md:text-base"
            >
              {isSubmitting ? 'Updating...' : 'Update Tender'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 