"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(result.error || 'Failed to send reset password email')
      }
    } catch (error) {
      console.error(error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#4B0082]">
            Reset Password
          </h1>
          {!isSubmitted ? (
            <p className="text-sm md:text-base text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          ) : (
            <p className="text-sm md:text-base text-green-600">
              If an account exists for {email}, you will receive password reset instructions.
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm md:text-base">
            {error}
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm md:text-base font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#4B0082] text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-sm md:text-base"
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Check your email for instructions to reset your password.
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-[#4B0082] text-white py-2 rounded-md hover:bg-purple-700 text-sm md:text-base"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}