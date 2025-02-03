'use client'

import { useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lock } from 'lucide-react'
import { changePassword } from "@/app/actions/user-actions"

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      // Validate password strength
      if (formData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      if (!session?.user?.id) {
        throw new Error('User not authenticated')
      }

      await changePassword(
        String(session.user.id),
        formData.currentPassword,
        formData.newPassword
      )

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      })

      router.push('/vendor/settings')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VendorLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Change Password</h1>
          <p className="text-sm md:text-base text-gray-600">Update your account password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/vendor/settings')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
} 