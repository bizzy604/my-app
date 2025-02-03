'use client'

import { Clock } from 'lucide-react'
import { formatDate } from "@/lib/utils"

interface TimelineEvent {
  id: string
  status: string
  date: string
  comments?: string
  changedBy: {
    name: string
  }
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-8 pb-4">
          {/* Timeline line */}
          {index !== events.length - 1 && (
            <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-200" />
          )}
          
          {/* Timeline dot */}
          <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-[#4B0082] flex items-center justify-center">
            <Clock className="h-3 w-3 text-white" />
          </div>
          
          {/* Event content */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{event.status}</h4>
              <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
            </div>
            {event.comments && (
              <p className="text-sm text-gray-600 mt-1">{event.comments}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">By {event.changedBy.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 