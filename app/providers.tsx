'use client'

import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SWRConfig 
        value={{
          revalidateOnFocus: false,
          fetcher: (url: string) => fetch(url).then(res => res.json())
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  )
}