'use client'

import { useSession, signOut } from 'next-auth/react'
import { Menu, User, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

interface TopNavProps {
  onMenuClick: () => void
  logo?: React.ReactNode
}

export function TopNav({ onMenuClick, logo }: TopNavProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={(e) => {
              e.preventDefault()
              onMenuClick()
            }}
          >
            <Menu className="h-6 w-6" />
          </Button>
          {logo || <h1 className="text-lg md:text-xl font-bold text-primary">Innobid</h1>}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}