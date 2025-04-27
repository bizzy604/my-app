"use client"
import Link from "next/link"
import { useState } from 'react'
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Award, AlertTriangle, LogOut, LayoutDashboard, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { ThemeToggle } from "./theme-toggle"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    // Implement actual sign out logic here
    setShowAlert(true)
    router.push('/login')
    return'/login'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-card border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/citizen" className="flex-shrink-0">
          <Image
            src="/Innobid Logo.jpg"
            alt="InnoBid Logo"
            width={160}
            height={50}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 border-r
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col p-4 md:p-6">
          {/* Logo - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <Link href="/citizen" className="flex items-center justify-center">
              <Image
                src="/Innobid Logo.jpg"
                alt="InnoBid Logo"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-accent"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            className="mt-auto w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 md:p-0 mt-14 md:mt-0">
        <Alert
          message="You have been successfully signed out."
          isVisible={showAlert}
          onClose={() => setShowAlert(false)}
        />
        {children}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}