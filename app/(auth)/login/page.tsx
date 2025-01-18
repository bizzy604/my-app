'use client'

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSession } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('registered') === 'true') {
      setSuccessMessage("Registration successful! Please log in.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log('Attempting login with:', { email, password }) // Debug log

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      console.log('Sign in result:', result) // Debug log

      if (!result?.error) {
        // Check user role and redirect accordingly
        const session = await getSession()

        if (!session?.user?.role) {
          setError("Unable to get user role")
          return
        }  
        switch (session.user.role){
          case 'procurement':
            router.push('/procurement-officer')
            break
          case 'vendor':
            router.push('/vendor')
            break
          case 'citizen':
            router.push('/citizen')
            break
          default:
            setError("Invalid user role")
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (error) {
      console.error('Login error:', error) // Debug log
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-6 max-w-md mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-[#4B0082]">Login</h1>
        </div>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Input 
              id="password" 
              type="password"
              value={password}
              placeholder="Your password"
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-md border-gray-300"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <Button 
            className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white font-semibold py-2 px-4 rounded-md" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <div className="mb-2">
            {"Don't have an account? "}
            <Link href="/signup" className="text-[#4B0082] hover:underline font-medium">
              Sign up
            </Link>
          </div>
          <Link href="/reset-password" className="text-[#4B0082] hover:underline font-medium">
            Forgot your Password? Reset it here
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}