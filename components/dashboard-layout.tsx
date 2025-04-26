'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, History, BookOpen, Bell, Settings, HelpCircle, MessageSquare, LogOut, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { signOut, useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { SideNav } from "@/components/side-nav"
import { TopNav } from "@/components/top-nav"
import SubscriptionStatus from "@/components/subscription-status"

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
  { title: "Reports", href: "/procurement-officer/reports", icon: HelpCircle }
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
  const { data: session } = useSession()
  
  // Get subscription data directly from the session
  const subscriptionData = {
    tier: session?.user?.subscriptionTier,
    status: session?.user?.hasActiveSubscription ? 'active' : 'inactive'
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        router.push('/login');
      }, 3000);
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <TopNav 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        logo={
          <Link href="/procurement-officer">
            <Image
              src="/Innobid Logo.jpg"
              alt="InnoBid Logo"
              width={50}
              height={50}
              className="h-auto w-auto"
            />
          </Link>
        }
      />
      
      <div className="flex">
        {/* Side Navigation */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-16">
            <nav className="flex-1 px-4 space-y-2 py-4">
              <Link href="/procurement-officer">
              <Image
                src="/Innobid Logo.jpg"
                alt="InnoBid Logo"
                width={120}
                height={40}
                className="h-auto w-auto"
              />
            </Link>
              
              {/* Subscription Status Component */}
              {session?.user?.role === 'PROCUREMENT' && (
                <div className="mb-4 mt-4">
                  <SubscriptionStatus 
                    tier={subscriptionData.tier} 
                    status={subscriptionData.status}
                    showManageButton={true}
                  />
                </div>
              )}

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
              className="mt-auto w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 text-gray-400" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:pl-64">
          <Alert
            message="You have been successfully signed out."
            isVisible={showAlert}
            onClose={() => setShowAlert(false)}
          />
            {children}
        </main>
      </div>
    </div>
  )
}