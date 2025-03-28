'use client'

import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        fetcher: (url: string) => fetch(url).then(res => res.json())
      }}
    >
      {children}
    </SWRConfig>
  )
} 