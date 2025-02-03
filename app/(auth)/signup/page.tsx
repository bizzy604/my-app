'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { AuthLayout } from '@/components/auth-layout'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'VENDOR' | 'PROCUREMENT' | 'CITIZEN'>('VENDOR')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Registration Failed',
          description: result.message || 'An error occurred during registration',
          variant: 'destructive'
        })
        return
      }

      // Store email for verification pending page
      localStorage.setItem('registeredEmail', email)

      // Redirect to verification pending page
      toast({
        title: 'Registration Successful',
        description: 'Please verify your email',
        variant: 'default'
      })
      router.push('/verification-pending')
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout isSignUp>
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#4B0082]">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">Join Innobid today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Full Name"
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm Password"
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'VENDOR' | 'PROCUREMENT' | 'CITIZEN')}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="VENDOR">Vendor</option>
              <option value="PROCUREMENT">Procurement</option>
              <option value="CITIZEN">Citizen</option>
            </select>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#4B0082] text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-sm md:text-base"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </Button>

          <p className="text-center text-xs md:text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4B0082] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}