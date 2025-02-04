'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  History, 
  BarChart2, 
  Bell, 
  Settings, 
  HelpCircle,
  X
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: 'Active Tenders',
    href: '/procurement-officer/tenders',
    icon: FileText
  },
  {
    title: 'Tender History',
    href: '/procurement-officer/tenders-history',
    icon: History
  },
  {
    title: 'Reports',
    href: '/procurement-officer/reports',
    icon: BarChart2
  },
  {
    title: 'Notifications',
    href: '/procurement-officer/notifications',
    icon: Bell
  },
  {
    title: 'Settings',
    href: '/procurement-officer/settings',
    icon: Settings
  },
  {
    title: 'Help & Support',
    href: '/procurement-officer/support',
    icon: HelpCircle
  }
]

interface SideNavProps {
  isOpen: boolean
  onClose: () => void
}

export function SideNav({ isOpen, onClose }: SideNavProps) {
  const pathname = usePathname()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50",
        "transform transition-transform duration-200 ease-in-out md:translate-x-0",
        "md:static md:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 md:hidden">
          <h2 className="font-semibold text-lg text-[#4B0082]">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-purple-50 text-[#4B0082]" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
} 