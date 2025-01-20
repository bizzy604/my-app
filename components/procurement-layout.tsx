'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  ShieldCheck, 
  BarChart2, 
  Users, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from './ui/button'

const PROCUREMENT_MENU_ITEMS = [
  { 
    label: 'Reports', 
    href: '/procurement/reports', 
    icon: ShieldCheck 
  },
  { 
    label: 'Tenders', 
    href: '/procurement/tenders', 
    icon: FileText 
  },
  { 
    label: 'Analytics', 
    href: '/procurement/analytics', 
    icon: BarChart2 
  },
  { 
    label: 'Users', 
    href: '/procurement/users', 
    icon: Users 
  }
]

export function ProcurementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-[#4B0082]">
            Procurement Dashboard
          </h1>
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="p-4">
          {PROCUREMENT_MENU_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`
                  flex items-center p-3 rounded-lg mb-2 transition-colors
                  ${pathname === item.href 
                    ? 'bg-[#4B0082] text-white' 
                    : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-[#4B0082]">
              Procurement Dashboard
            </h1>
            <div>{/* Placeholder for additional mobile header content */}</div>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
