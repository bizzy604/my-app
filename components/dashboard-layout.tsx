'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, History, BookOpen, Bell, Settings, HelpCircle, MessageSquare, LogOut, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { signOut } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { SideNav } from "@/components/side-nav"
import { TopNav } from "@/components/top-nav"

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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showAlert, setShowAlert] = useState(false)
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Side Navigation */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-16">
            <nav className="flex-1 px-4 space-y-2 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-purple-50 text-[#4B0082]" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full md:pl-64 pt-16">
          <div className="container mx-auto max-w-7xl p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}