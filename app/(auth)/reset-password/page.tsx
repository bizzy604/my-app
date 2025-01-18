"use client"

import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Implement password reset logic here
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setIsSubmitted(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-[500px] h-[500px] max-w-md mx-auto space-y-6 p-8 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-[#4B0082]">Reset Password</h1>
          {!isSubmitted ? (
            <p className="text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          ) : (
            <p className="text-green-600">
              If an account exists for {email}, you will receive password reset instructions.
            </p>
          )}
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                placeholder="email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-md border-gray-300"
              />
            </div>
            <Button 
              className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white font-semibold py-2 px-4 rounded-md"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </form>
        ) : (
          <Button 
            className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white font-semibold py-2 px-4 rounded-md"
            onClick={() => window.location.href = '/login'}
          >
            Return to Login
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}