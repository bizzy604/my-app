"use client"
import Link from "next/link"
import { useState } from 'react'
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Award, AlertTriangle, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { signOut } from "next-auth/react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/citizen", icon: LayoutDashboard },
  { title: "Available Tenders", href: "/citizen/tenders", icon: FileText },
  { title: "Awarded Tenders", href: "/citizen/awarded-tenders", icon: Award },
  { title: "Report Irregularity", href: "/citizen/report", icon: AlertTriangle },
]

export function CitizenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showAlert, setShowAlert] = useState(false)

  const handleSignOut = () => {
    // Implement actual sign out logic here
    setShowAlert(true)
    router.push('/login')
    return'/login'
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-6">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link href="/citizen/dashboard" className="mb-8">
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