'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    
    async function verifyEmail() {
      if (!token) {
        setStatus('error')
        setErrorMessage('No verification token found.')
        return
      }

      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const result = await response.json()

        if (response.ok) {
          setStatus('success')
          // Redirect to login after 3 seconds
          const timer = setTimeout(() => {
            router.push('/login')
          }, 3000)
          return () => clearTimeout(timer)
        } else {
          setStatus('error')
          setErrorMessage(result.error || 'Email verification failed.')
        }
      } catch (error) {
        console.error('Email verification error:', error)
        setStatus('error')
        setErrorMessage('An unexpected error occurred.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[#4B0082]">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Verifying your email address for Innobid
          </p>
        </div>
        
        {status === 'loading' && (
          <div className="text-center">
            <p className="text-blue-600">Verifying your email...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-600 text-xl">Email Verified Successfully!</p>
            <p className="mt-2 text-gray-600">You will be redirected to login shortly.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 text-xl">Verification Failed</p>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            
            <div className="mt-6 space-y-4">
              <Link href="/resend-verification" passHref>
                <Button variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="secondary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
