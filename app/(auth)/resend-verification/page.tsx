'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResendVerification = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      // Check if user exists
      const userResponse = await fetch(`/api/user/check-email?email=${encodeURIComponent(email)}`)
      const userData = await userResponse.json()

      if (!userResponse.ok) {
        toast({
          title: 'User Not Found',
          description: 'No account found with this email address',
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      // Check if user is already verified
      if (userData.emailVerified) {
        toast({
          title: 'Email Already Verified',
          description: 'This email address has already been verified',
          variant: 'default'
        })
        router.push('/login')
        return
      }

      // Generate new verification token and send email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Verification Email Sent',
          description: 'A new verification email has been sent to your email address.',
          variant: 'default'
        })
        router.push('/verification-pending')
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to resend verification email. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast({
        title: 'Network Error',
        description: 'Unable to resend verification email. Please check your internet connection.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-[#4B0082]">Resend Verification Email</h1>
          <p className="text-gray-600">Enter your email to receive a new verification link</p>
        </div>

        <form onSubmit={handleResendVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#4B0082] text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Remember to check your spam folder if you don't see the email.{' '}
            <Link href="/login" className="text-[#4B0082] hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
