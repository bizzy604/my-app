'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { User, Building, Phone, Mail, MapPin, Globe } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    registrationNumber: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    businessType: '',
    establishmentDate: '',
    website: ''
  })

  useEffect(() => {
    if (session?.user?.id) {
      // Load initial profile data
      const loadProfile = async () => {
        try {
          const response = await fetch(`/api/user/profile/${session.user.id}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Profile loading error:', errorText)
            return
          }
          
          const userData = await response.json()
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            company: userData.company || '',
            registrationNumber: userData.registrationNumber || '',
            address: userData.address || '',
            city: userData.city || '',
            country: userData.country || '',
            postalCode: userData.postalCode || '',
            businessType: userData.businessType || '',
            establishmentDate: userData.establishmentDate ? 
              new Date(userData.establishmentDate).toISOString().split('T')[0] : '',
            website: userData.website || ''
          })
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
      loadProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Fix the URL to match the file path case exactly
      const response = await fetch('/api/user/updateProfile', {  // Note the capital 'P' in updateProfile
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: session?.user?.id,
          profile: formData
        })
      })

      // Add error logging to help debug
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(response.status === 404 ? 'API endpoint not found' : errorText)
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VendorLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Company Profile</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your company information</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      disabled={!isEditing}
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROFIT">Profit</SelectItem>
                        <SelectItem value="NON_PROFIT">Non-Profit</SelectItem>
                        <SelectItem value="ACADEMIC_INSTITUTION">Academic Institution</SelectItem>
                        <SelectItem value="GOVERNMENT_MULTI_AGENCY">Government & Multi Agency</SelectItem>
                        <SelectItem value="OTHERS">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishmentDate">Establishment Date</Label>
                    <Input
                      id="establishmentDate"
                      type="date"
                      value={formData.establishmentDate}
                      onChange={(e) => setFormData({ ...formData, establishmentDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}
