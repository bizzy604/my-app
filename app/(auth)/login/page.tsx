'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AuthLayout } from "@/components/auth-layout"
import { Session } from 'next-auth'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const { data: session, status } = useSession() as { data: Session | null; status: string }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Check for callbackUrl in URL and clear it if present
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('callbackUrl')) {
      // Extract the path from the callback URL
      try {
        const callbackUrl = url.searchParams.get('callbackUrl');
        if (callbackUrl && (callbackUrl.includes('innobid.net') || callbackUrl.includes('localhost'))) {
          const parsedCallback = new URL(callbackUrl);
          // Store just the path for later use
          sessionStorage.setItem('redirectPath', parsedCallback.pathname);
        }
      } catch (e) {
        console.error('Error parsing callbackUrl', e);
      }
      
      // Remove the callbackUrl param to prevent redirect loops
      url.searchParams.delete('callbackUrl');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // First try to get the saved redirect path from the callbackUrl
      const savedPath = sessionStorage.getItem('redirectPath');
      if (savedPath) {
        sessionStorage.removeItem('redirectPath');
        router.push(savedPath);
      } else {
        // Fall back to role-based redirect
        const redirectPath = getUserRedirectPath(session.user.role);
        router.push(redirectPath);
      }
    }
  }, [session, status, router]);

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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Get user role first for redirection
      let redirectPath = '/'
      // Use the generated CSRF token from the utility function
      const csrfToken = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'development-token';
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch('/api/auth/redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (userData.role) {
          redirectPath = getUserRedirectPath(userData.role.toLowerCase());
        }
      } else {
        setError("Failed to get user role");
        setIsLoading(false);
        return;
      }
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: redirectPath
      });
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('Authentication successful, redirecting to:', redirectPath);
        
        // Make sure we have an authenticated session before redirecting
        const session = await fetch('/api/auth/session');
        const sessionData = await session.json();
        
        if (sessionData?.user) {
          // Use Next.js router for a cleaner transition with preserved session
          router.refresh();
          router.push(redirectPath);
        } else {
          // Fallback to hard redirect if session isn't immediately available
          window.location.href = redirectPath;
        }
      } else {
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
      
    } catch (error) {
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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