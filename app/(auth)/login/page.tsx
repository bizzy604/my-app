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
        console.log(`Redirecting to saved path: ${savedPath}`);
        router.push(savedPath);
      } else {
        // Fall back to role-based redirect
        const redirectPath = getUserRedirectPath(session.user.role);
        console.log(`Redirecting to role-based path: ${redirectPath}`);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    console.log('------- LOGIN PROCESS STARTED -------');
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    console.log(`Attempting login for email: ${email}`);

    try {
      console.log('Calling signIn with credentials...');
      
      // First get the user role to determine the correct redirect path
      console.log('Pre-fetching role for redirect path...');
      const roleResponse = await fetch('/api/auth/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      let redirectPath = '/';
      if (roleResponse.ok) {
        const userData = await roleResponse.json();
        console.log('Retrieved user role for redirection:', userData.role);
        
        if (userData.role) {
          redirectPath = getUserRedirectPath(userData.role.toLowerCase());
          console.log(`Will redirect to: ${redirectPath} after successful login`);
        }
      }
      
      // Basic login via NextAuth (without relying on its redirect)
      console.log(`Using signIn with NO redirect`);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      console.log('Sign-in result:', result);
      
      if (result?.error) {
        console.log(`Login error received: ${result.error}`);
        // Check for email verification error
        if (result.error.includes('Please verify your email')) {
          console.log('Email verification error detected, redirecting to verification page');
          toast({
            title: 'Email Not Verified',
            description: 'Please verify your email before logging in. Check your inbox or resend verification.',
            variant: 'destructive'
          })
          router.push('/resend-verification')
          return
        }

        console.log('Invalid credentials error');
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
      
      if (result?.ok) {
        console.log('Login successful, performing direct navigation');
        
        // Direct navigation approach with full URL
        const baseUrl = window.location.origin;
        const fullRedirectUrl = `${baseUrl}${redirectPath}`;
        console.log(`Redirecting to: ${fullRedirectUrl}`);
        
        // Force full page reload to reset state
        window.location.href = fullRedirectUrl;
        return;
      }
      
      // Should never reach here
      console.log('Unexpected login state, using fallback');
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('Unhandled login error:', error)
      setError("An unexpected error occurred")
      setIsLoading(false)
      console.log('------- LOGIN PROCESS FAILED WITH EXCEPTION -------');
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