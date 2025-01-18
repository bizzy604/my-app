'use client'

import { useState } from 'react'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Check, FileText, Upload, User } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

export default function CitizenReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tenderReference: '',
    irregularityType: '',
    description: '',
    contactInfo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Here you would typically send the formData to your backend
    console.log('Submitted data:', formData)

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, irregularityType: value }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  if (isSuccess) {
    return (
      <CitizenLayout>
        <div className="flex h-full items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 p-2">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">Report Submitted</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Thank you for your report. We will investigate the matter and take appropriate action.
                </p>
                <Button 
                  className="bg-[#4B0082] hover:bg-[#3B0062]"
                  onClick={() => {
                    setIsSuccess(false)
                    setStep(1)
                    setFormData({
                      tenderReference: '',
                      irregularityType: '',
                      description: '',
                      contactInfo: ''
                    })
                  }}
                >
                  Submit Another Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CitizenLayout>
    )
  }

  return (
    <CitizenLayout>
      <div className="container mx-auto max-w-4xl p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-[#4B0082]">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <span>Report Irregularity</span>
            </CardTitle>
            <CardDescription>
              Submit a report for any suspicious activities or irregularities in the tender process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={(step / 3) * 100} className="h-2 w-full" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenderReference" className="text-base font-semibold">Tender Reference (if applicable)</Label>
                    <Input 
                      id="tenderReference" 
                      name="tenderReference"
                      value={formData.tenderReference}
                      onChange={handleInputChange}
                      placeholder="e.g., TOO2/2023" 
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="irregularityType" className="text-base font-semibold">Type of Irregularity</Label>
                    <Select onValueChange={handleSelectChange} value={formData.irregularityType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type of irregularity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corruption">Corruption</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="collusion">Collusion</SelectItem>
                        <SelectItem value="conflict-of-interest">Conflict of Interest</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">Description of the Irregularity</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide a detailed description of the irregularity you've observed"
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence" className="text-base font-semibold">Evidence (if any)</Label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="evidence" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 10MB)</p>
                        </div>
                        <Input id="evidence" type="file" className="hidden" multiple />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="text-base font-semibold">Your Contact Information (optional)</Label>
                    <Input 
                      id="contactInfo" 
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      placeholder="Email or phone number" 
                      className="h-10"
                    />
                    <p className="text-sm text-gray-500">This will allow us to contact you for more information if needed</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" className="bg-[#4B0082] hover:bg-[#3B0062] ml-auto" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-[#4B0082] hover:bg-[#3B0062] ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CitizenLayout>
  )
}