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
  interface CustomSession extends Session {
    user: {
      id: number;
      email: string;
      name?: string | null;
      role: string;
      company?: string;
    };
  }
  
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

      // Fetch user role and redirect
      const userResponse = await fetch(`/api/user-role?email=${email}`)
      const userData = await userResponse.json()

      const redirectPath = getUserRedirectPath(userData.role)
      router.push(redirectPath)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#4B0082]">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
              <Button 
                className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white font-semibold py-2 px-4 rounded-md" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#4B0082] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}