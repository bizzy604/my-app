'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Trash2,
  Filter
} from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getNotifications, markAsRead, deleteNotification, NotificationType } from "@/app/actions/notification-actions"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { useSession } from "next-auth/react"

interface Notification {
  id: string
  type: NotificationType
  message: string
  createdAt: string
  isRead: boolean
  userId: string
  link?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useHydrationSafeClient<Notification[]>(
    () => getNotifications(session?.user?.id?.toString())
  )
  
  const notifications = data || []

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    return notification.type.toLowerCase() === filter
  })

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      toast({
        title: 'Success',
        description: 'Notification marked as read',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      toast({
        title: 'Success',
        description: 'Notification deleted',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      })
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'TENDER':
        return <FileText className="h-5 w-5" />
      case 'BID':
        return <CheckCircle2 className="h-5 w-5" />
      case 'SUPPORT_TICKET':
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary">Notifications</h1>
            <p className="text-sm md:text-base text-muted-foreground">Stay updated with your latest activities</p>
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="tender">Tenders</SelectItem>
              <SelectItem value="bid">Bids</SelectItem>
              <SelectItem value="support_ticket">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-colors ${
                  notification.isRead ? 'bg-card' : 'bg-primary/5 dark:bg-primary/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    notification.isRead ? 'bg-muted' : 'bg-primary/10 dark:bg-primary/20'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={notification.isRead ? 'outline' : 'default'}>
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{notification.message}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="hidden sm:flex"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No notifications found
          </div>
        )}

        {/* Mobile Actions Button */}
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 md:hidden shadow-lg"
          onClick={() => {/* TODO: Implement mobile filters */}}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
    </DashboardLayout>
  )
} 