'use client'

import { CitizenLayout } from "@/components/citizen-layout"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Suspense } from "react"

export default function CitizenRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense 
      fallback={
        <CitizenLayout>
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        </CitizenLayout>
      }
    >
      {children}
    </Suspense>
  )
} 