'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerificationPendingPage() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Retrieve email from local storage
    const storedEmail = localStorage.getItem('registeredEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 md:py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-md text-center">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#4B0082] mb-4">
            Verify Your Email
          </h1>
          
          <div className="mb-6">
            <p className="text-sm md:text-base text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-[#4B0082] text-sm md:text-base">
              {email}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm md:text-base text-gray-700">
              Please check your email inbox (and spam folder) and click on the verification link to activate your account.
            </p>

            <div className="flex flex-col space-y-3">
              <Link href="/resend-verification" passHref>
                <Button 
                  variant="outline" 
                  className="w-full text-sm md:text-base py-2"
                >
                  Resend Verification Email
                </Button>
              </Link>

              <Link href="/login" passHref>
                <Button 
                  variant="secondary" 
                  className="w-full text-sm md:text-base py-2"
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
