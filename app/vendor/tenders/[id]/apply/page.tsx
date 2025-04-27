'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Upload, FileText, X } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { submitBid } from "@/app/actions/tender-actions"

interface FileUpload {
  file: File
  fileName: string
  fileType: string
  fileSize: number
  fileData?: string | number[]
}

export default function ApplyTenderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [amount, setAmount] = useState('')
  const [completionTime, setCompletionTime] = useState('')
  const [technicalProposal, setTechnicalProposal] = useState('')
  const [vendorExperience, setVendorExperience] = useState('')
  const [uploads, setUploads] = useState<FileUpload[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUploads: FileUpload[] = []
      
      for (const file of e.target.files) {
        // Validate file size (e.g., 10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB size limit`,
            variant: "destructive",
          })
          continue
        }

        // Convert file to base64
        const fileData = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        newUploads.push({
          file,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: fileData.split(',')[1] // Remove data URL prefix
        })
      }

      setUploads([...uploads, ...newUploads])
    }
  }

  const removeUpload = (index: number) => {
    setUploads(uploads.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated')
      }

      await submitBid({
        tenderId: params.id,
        bidderId: session.user.id,
        amount: parseFloat(amount),
        completionTime,
        technicalProposal,
        vendorExperience,
        documents: uploads.map(upload => ({
          fileName: upload.fileName,
          fileType: upload.fileType,
          fileSize: upload.fileSize,
          fileData: upload.fileData!
        }))
      })

      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully.",
      })

      router.push('/vendor/tenders')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit bid",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-primary">Submit Bid</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bid Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Bid Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="completionTime">Completion Time</Label>
                <Input
                  id="completionTime"
                  value={completionTime}
                  onChange={(e) => setCompletionTime(e.target.value)}
                  required
                  placeholder="e.g., 3 months"
                />
              </div>

              <div>
                <Label htmlFor="technicalProposal">Technical Proposal</Label>
                <Textarea
                  id="technicalProposal"
                  value={technicalProposal}
                  onChange={(e) => setTechnicalProposal(e.target.value)}
                  required
                  className="min-h-[200px]"
                  placeholder="Describe your technical approach..."
                />
              </div>

              <div>
                <Label htmlFor="vendorExperience">Relevant Experience</Label>
                <Textarea
                  id="vendorExperience"
                  value={vendorExperience}
                  onChange={(e) => setVendorExperience(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Describe your relevant experience..."
                />
              </div>

              <div>
                <Label>Supporting Documents</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </div>

                  {uploads.length > 0 && (
                    <div className="space-y-2">
                      {uploads.map((upload, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{upload.fileName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUpload(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 