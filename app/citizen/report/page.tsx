'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Check, FileText, Shield } from 'lucide-react'
import { getTenders } from "@/app/actions/tender-actions"
import { submitIrregularityReport } from "@/app/actions/report-actions"

// Define types for form data and tenders
type TenderOption = {
  id: string;
  title: string;
  reference: string;
}

interface ReportFormData {
  tenderId: string
  reportType: "IRREGULARITY" | "FRAUD" | "CONFLICT_OF_INTEREST" | "OTHER"
  description: string
  reporterName?: string
  contactInfo?: string
}

const REPORT_TYPES = [
  { 
    value: "IRREGULARITY", 
    label: "Irregularity", 
    subtypes: [
      'Bid Manipulation',
      'Unfair Evaluation',
      'Other Misconduct'
    ]
  },
  { 
    value: "FRAUD", 
    label: "Fraud", 
    subtypes: [
      'Corruption',
      'Financial Misrepresentation',
      'False Documentation'
    ]
  },
  { 
    value: "CONFLICT_OF_INTEREST", 
    label: "Conflict of Interest", 
    subtypes: [
      'Personal Relationship',
      'Financial Interest',
      'Undisclosed Connections'
    ]
  },
  { 
    value: "OTHER", 
    label: "Other", 
    subtypes: ['Other Unspecified Issue']
  }
]

export default function CitizenReportPage() {
  const router = useRouter()
  const [tenders, setTenders] = useState<TenderOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReportFormData>({
    tenderId: '',
    reportType: "IRREGULARITY",
    description: '',
    reporterName: '',
    contactInfo: ''
  })
  const [selectedSubtype, setSelectedSubtype] = useState('')

  // Fetch tenders when component mounts
  const loadTenders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTenders = await getTenders()
      const tenderOptions = fetchedTenders.map(tender => ({
        id: tender.id,
        title: tender.title,
        reference: tender.id.slice(-6).toUpperCase()
      }))
      setTenders(tenderOptions)
    } catch (error) {
      setError("Failed to load tenders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset previous messages
    setError(null)
    setSuccess(null)
    
    // Validate form
    if (!formData.tenderId || !formData.reportType || !formData.description) {
      setError("Please fill in all required fields.")
      return
    }

    try {
      setIsLoading(true)
      
      // Submit the report using the server action
      const result = await submitIrregularityReport({
        ...formData,
        reportSubtype: selectedSubtype,
        evidence: '' // Optional: add file upload logic later
      })
      
      if (result.success) {
        setSuccess(result.message)

        // Reset form after successful submission
        setFormData({
          tenderId: '',
          reportType: "IRREGULARITY",
          description: '',
          reporterName: '',
          contactInfo: ''
        })
        setSelectedSubtype('')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("There was an unexpected error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CitizenLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="bg-background border rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center mb-4 sm:mb-6">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Report Tender Irregularity
            </h1>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-6">
            Your confidential report helps maintain transparency and integrity 
            in the public procurement process. All information will be treated 
            with strict confidentiality.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tenderId">Select Tender</Label>
              <Select 
                value={formData.tenderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tenderId: value }))}
                onOpenChange={(open) => open && loadTenders()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Tender" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading tenders...</div>
                  ) : tenders.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">No tenders available</div>
                  ) : (
                    tenders.map(tender => (
                      <SelectItem key={tender.id} value={tender.id}>
                        {tender.title} (Ref: {tender.reference})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportType">Type of Report</Label>
              <Select 
                value={formData.reportType}
                onValueChange={(value: ReportFormData['reportType']) => {
                  setFormData(prev => ({ ...prev, reportType: value }))
                  setSelectedSubtype('') // Reset subtype when main type changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportSubtype">Specific Type of {REPORT_TYPES.find(r => r.value === formData.reportType)?.label}</Label>
              <Select 
                value={selectedSubtype}
                onValueChange={(value) => setSelectedSubtype(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${formData.reportType} Subtype`} />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.find(r => r.value === formData.reportType)?.subtypes.map(subtype => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description of Report</Label>
              <Textarea 
                id="description"
                placeholder="Provide detailed information about the observed issue"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reporterName">Your Name (Optional)</Label>
                <Input 
                  id="reporterName"
                  placeholder="Enter your name"
                  value={formData.reporterName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="contactInfo">Contact Information (Optional)</Label>
                <Input 
                  id="contactInfo"
                  placeholder="Email or phone number"
                  value={formData.contactInfo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </div>
      </div>
    </CitizenLayout>
  )
}