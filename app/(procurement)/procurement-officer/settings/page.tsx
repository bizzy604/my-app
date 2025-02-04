'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Bell
} from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, updateUserSettings } from "@/app/actions/user-actions"

interface NotificationSettings {
  emailNotifications: boolean
  bidUpdates: boolean
  tenderDeadlines: boolean
  systemAnnouncements: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    bidUpdates: true,
    tenderDeadlines: true,
    systemAnnouncements: true
  })

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const formData = new FormData(e.currentTarget)
      const profileData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company: formData.get('company') as string,
      }

      await updateUserProfile(profileData)
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNotificationChange = async (key: keyof NotificationSettings) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [key]: !notificationSettings[key]
      }
      setNotificationSettings(newSettings)
      await updateUserSettings({ notifications: newSettings })
      
      toast({
        title: 'Success',
        description: 'Notification settings updated',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive'
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Settings</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      name="name"
                      defaultValue={session?.user?.name || ''}
                      className="pl-9 text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={session?.user?.email || ''}
                      className="pl-9 text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={session?.user?.phone || ''}
                      className="pl-9 text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="company"
                      name="company"
                      defaultValue={session?.user?.company || ''}
                      className="pl-9 text-sm md:text-base"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-[#4B0082] hover:bg-purple-700 text-white"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={() => handleNotificationChange('emailNotifications')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bid Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about bid status changes</p>
                </div>
                <Switch
                  checked={notificationSettings.bidUpdates}
                  onCheckedChange={() => handleNotificationChange('bidUpdates')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tender Deadlines</Label>
                  <p className="text-sm text-gray-500">Reminders about upcoming deadlines</p>
                </div>
                <Switch
                  checked={notificationSettings.tenderDeadlines}
                  onCheckedChange={() => handleNotificationChange('tenderDeadlines')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Announcements</Label>
                  <p className="text-sm text-gray-500">Important system updates and news</p>
                </div>
                <Switch
                  checked={notificationSettings.systemAnnouncements}
                  onCheckedChange={() => handleNotificationChange('systemAnnouncements')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 