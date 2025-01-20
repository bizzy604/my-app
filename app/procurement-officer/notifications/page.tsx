'use client'

import { useState } from 'react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type NotificationPreferences = {
  inApp: boolean
  email: boolean
  sms: boolean
}

export default function NotificationPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inApp: true,
    email: true,
    sms: false,
  })

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    // In a real application, you would save these preferences to the user's profile
    console.log('Saving preferences:', preferences)
    // Implement API call to save preferences
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#4B0082]">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="in-app" className="text-base font-medium">
                  In-app Notifications
                </Label>
                <Switch
                  id="in-app"
                  checked={preferences.inApp}
                  onCheckedChange={() => handleToggle('inApp')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Notifications
                </Label>
                <Switch
                  id="email"
                  checked={preferences.email}
                  onCheckedChange={() => handleToggle('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <Switch
                  id="sms"
                  checked={preferences.sms}
                  onCheckedChange={() => handleToggle('sms')}
                />
              </div>
              <Button 
                onClick={handleSave}
                className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white"
              >
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
