'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit,
  Trash,
  ArrowLeft
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DocumentManager } from "@/components/document-manager"
import { useToast } from "@/hooks/use-toast"
import { getTenderById, deleteTender } from "@/app/actions/tender-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TenderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: tender, isLoading } = useHydrationSafeClient(() => getTenderById(params.id))

  const handleEdit = () => {
    router.push(`/procurement-officer/tenders/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tender?')) return

    setIsDeleting(true)
    try {
      await deleteTender(params.id)
      toast({
        title: 'Success',
        description: 'Tender deleted successfully',
        variant: 'default'
      })
      router.push('/procurement-officer/tenders')
    } catch (error) {
      console.error('Error deleting tender:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tender',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewBids = () => {
    router.push(`/procurement-officer/tenders/${params.id}/bids`)
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
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">{tender.title}</h1>
            <p className="text-sm md:text-base text-gray-600">Tender Details</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="text-sm md:text-base"
          >
            <Edit className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Edit</span>
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
            className="text-sm md:text-base"
          >
            <Trash className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </Button>
          <Button
            onClick={handleViewBids}
            className="bg-[#4B0082] text-white hover:bg-purple-700 text-sm md:text-base"
          >
            <Users className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">View Bids</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Location: {tender.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Closing Date: {new Date(tender.closingDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>Budget: ${tender.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Category: {tender.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Badge variant={tender.status === 'OPEN' ? 'default' : 'secondary'}>
                  {tender.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-600 whitespace-pre-wrap">
                {tender.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {tender.requirements.map((req, index) => (
                  <li key={index} className="text-sm md:text-base text-gray-600">
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {session?.user?.id && (
                <DocumentManager 
                  tenderId={params.id}
                  userId={session.user.id.toString()}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 