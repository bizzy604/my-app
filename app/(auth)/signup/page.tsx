// filepath: /C:/Users/Admin/Desktop/my-app/app/(auth)/signup/page.tsx

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const name = `${firstName} ${lastName}` // Combine first and last names
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as 'PROCUREMENT' | 'VENDOR' | 'CITIZEN'

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (response.ok) {
        router.push('/login?registered=true')
      } else {
        const data = await response.json()
        setError(data.message || "Registration failed")
      }
    } catch (error) {
      console.error('Signup Error:', error)
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout isSignUp>
      <div className="flex-w-1/3 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#4B0082]">Create an Account</h1>
          <p className="text-gray-500">Register to access the e-procurement system</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName"
                required 
                className="rounded-md border-gray-300" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName"
                required 
                className="rounded-md border-gray-300" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              required 
              className="rounded-md border-gray-300" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              required 
              className="rounded-md border-gray-300" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" required defaultValue="CITIZEN">
              <SelectTrigger className="rounded-md border-gray-300">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CITIZEN">Citizen</SelectItem>
                <SelectItem value="VENDOR">Vendor</SelectItem>
                <SelectItem value="PROCUREMENT">Procurement Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#4B0082] hover:bg-[#3B0062]"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4B0082] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}