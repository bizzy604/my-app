'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, History, BookOpen, Bell, Settings, HelpCircle, MessageSquare, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { signOut } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/procurement-officer", icon: LayoutDashboard },
  { title: "Tenders", href: "/procurement-officer/tenders", icon: FileText },
  { title: "Tenders History", href: "/procurement-officer/tenders-history", icon: History },
  { title: "Resource Center", href: "/procurement-officer/resource-center", icon: BookOpen },
  { title: "Notifications", href: "/procurement-officer/notifications", icon: Bell },
  { title: "Settings", href: "/procurement-officer/settings", icon: Settings },
  { title: "Reports", href: "/procurement-officer/reports", icon: HelpCircle },
  { title: "Give Feedback", href: "/procurement-officer/feedback", icon: MessageSquare },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showAlert, setShowAlert] = useState(false)
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',  // Explicitly redirect to login page
        redirect: true  // Enable automatic redirect
      })
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-6">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link href="/procurement-officer" className="mb-8">
            <Image
              src="/Innobid Logo.jpg"
              alt="InnoBid Logo"
              width={120}
              height={40}
              className="h-auto w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-[#4B0082] text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            className="mt-auto w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 text-gray-400" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Alert
          message="You have been successfully signed out."
          isVisible={showAlert}
          onClose={() => setShowAlert(false)}
        />
        {children}
      </div>
    </div>
  )
}