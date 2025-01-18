import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface AlertProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function Alert({ message, isVisible, onClose }: AlertProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsClosing(true)
        setTimeout(onClose, 300) // Match this with the transition duration
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center p-4 mb-4 text-white bg-green-500 rounded-lg",
        isClosing ? "animate-fade-out" : "animate-fade-in"
      )}
      role="alert"
    >
      <span className="sr-only">Info</span>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-green-600 text-white rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-700 inline-flex h-8 w-8 items-center justify-center"
        aria-label="Close"
        onClick={() => setIsClosing(true)}
      >
        <span className="sr-only">Close</span>
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}