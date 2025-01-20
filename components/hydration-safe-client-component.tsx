'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from "@/hooks/use-toast"

export function useHydrationSafeClient<T>(
  fetchDataFn: () => Promise<T>, 
  dependencies: any[] = []
) {
  const { toast } = useToast()
  const [data, setData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedData = await fetchDataFn()
        setData(fetchedData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isClient) {
      loadData()
    }
  }, [isClient, ...dependencies, toast])

  return { data, isLoading, isClient }
}

export function HydrationSafeLoader({ 
  isLoading, 
  isClient, 
  children, 
  fallback 
}: { 
  isLoading: boolean, 
  isClient: boolean, 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  if (!isClient || isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

export function safeSessionData(session: any) {
  return {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    image: session?.user?.image || ''
  }
}
