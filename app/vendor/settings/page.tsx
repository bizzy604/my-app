'use client'

import { useState } from 'react'
import { useSession } from "next-auth/react"
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, Phone, Lock } from 'lucide-react'
import { updateUserSettings } from "@/app/actions/user-actions"
import { useRouter } from "next/navigation"

export default function VendorSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bidUpdates: true,
    tenderAlerts: true,
    marketingEmails: false,
    twoFactorAuth: false
  })
  const router = useRouter()

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      setIsSubmitting(true)
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)

      if (session?.user?.id) {
        await updateUserSettings(session.user.id, newSettings)
        toast({
          title: "Settings Updated",
          description: "Your preferences have been saved successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
      // Revert the change
      setSettings(settings)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 border-b bg-background px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">Account Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your vendor profile and preferences</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive bid and tender updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get important updates via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bid Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications about your bid status</p>
                  </div>
                  <Switch
                    checked={settings.bidUpdates}
                    onCheckedChange={(checked) => handleSettingChange('bidUpdates', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tender Alerts</Label>
                    <p className="text-sm text-muted-foreground">New tender opportunities in your sector</p>
                  </div>
                  <Switch
                    checked={settings.tenderAlerts}
                    onCheckedChange={(checked) => handleSettingChange('tenderAlerts', checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/vendor/settings/change-password')}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </VendorLayout>
  )
}
