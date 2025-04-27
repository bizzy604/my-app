'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AuthLayout } from "@/components/auth-layout"
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const { data: session, status } = useSession() as { data: Session | null; status: string }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const redirectPath = getUserRedirectPath(session.user.role)
      router.push(redirectPath)
    }
  }, [session, status, router])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const message = searchParams.get('message')

    if (message === 'Password reset successfully') {
      toast({
        title: "Password Reset",
        description: "Your password has been successfully reset. Please log in.",
        variant: "default"
      })

      // Clear the message from URL to prevent repeated toasts
      window.history.replaceState({}, document.title, "/login")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Attempt to sign out first to clear previous session
      await signOut({ redirect: false })

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false  // We'll handle redirection manually
      })

      if (result?.error) {
        // Check for email verification error
        if (result.error.includes('Please verify your email')) {
          toast({
            title: 'Email Not Verified',
            description: 'Please verify your email before logging in. Check your inbox or resend verification.',
            variant: 'destructive'
          })
          router.push('/resend-verification')
          return
        }

        setError("Invalid email or password")
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
        setIsLoading(false)
        return
      }

      // After successful sign-in, useSession will update automatically
      // and the useEffect above will handle the redirection
      setIsLoading(false)
    } catch (error) {
      console.error('Login error:', error)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  // Helper function to determine redirect path
  const getUserRedirectPath = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'procurement': return '/procurement-officer'
      case 'vendor': return '/vendor'
      case 'citizen': return '/citizen'
      default: return '/'
    }
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
            Welcome to Innobid
          </h1>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-2 md:p-3 rounded-md text-center text-sm md:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="john.doe@example.com"
              className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/reset-password" 
                className="text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-sm md:text-base"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>

          <p className="text-center text-xs md:text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}