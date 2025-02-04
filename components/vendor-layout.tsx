'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  BookOpen, 
  Bell, 
  Settings, 
  HelpCircle, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { title: "Tenders", href: "/vendor/tenders", icon: FileText },
  { title: "Tenders History", href: "/vendor/tenders-history", icon: History },
  { title: "Resource Center", href: "/vendor/resource-center", icon: BookOpen },
  { title: "Notifications", href: "/vendor/notifications", icon: Bell },
  { title: "Settings", href: "/vendor/settings", icon: Settings },
  { title: "Profile", href: "/vendor/profile", icon: User },
  { title: "Give Feedback", href: "/vendor/feedback", icon: MessageSquare },

]

interface VendorLayoutProps {
  children: React.ReactNode
}

export function VendorLayout({ children }: VendorLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
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
      {/* Top Navigation - Mobile */}
      <header className="sticky top-0 z-40 md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-[#4B0082]">Innobid</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/80 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white p-6 transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-[#4B0082]">Menu</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-purple-50 text-[#4B0082]" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <Button
            variant="ghost"
            className="mt-auto w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex flex-col flex-1 p-6">
            <h2 className="text-lg font-bold text-[#4B0082] mb-8">Innobid</h2>
            <nav className="flex-1 space-y-2">
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
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>

            <Button
              variant="ghost"
              className="mt-auto w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:pl-64">
          {children}
        </main>
      </div>
    </div>
  )
}

