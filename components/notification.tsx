'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getNotificationsByUser, markNotificationAsRead } from "@/app/actions/notification-action"

export function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      const fetchedNotifications = await getNotificationsByUser(userId)
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
        <Bell className="h-5 w-5" />
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No notifications</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {!notification.isRead && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2 p-0"
                      >
                        Mark as read
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}