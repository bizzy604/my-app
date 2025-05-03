'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getNotificationsByUser, markNotificationAsRead } from "@/app/actions/notification-action"
import { Notification } from '@prisma/client'

export function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      const fetchedNotifications = await getNotificationsByUser(Number(userId))
      setNotifications(fetchedNotifications)
    }
    fetchNotifications()
  }, [userId])

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ))
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4 md:h-5 md:w-5" />
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>

      {isOpen && (
        <>
          <Card className="absolute right-0 mt-2 w-[280px] md:w-[320px] z-50 max-h-[80vh] overflow-hidden">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`p-3 md:p-4 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <p className="text-xs md:text-sm text-gray-800">{notification.message}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="mt-2 p-0 h-auto text-xs md:text-sm"
                          >
                            Mark as read
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Overlay to close notifications on mobile */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}