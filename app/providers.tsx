'use client'

import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/use-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <SWRConfig 
          value={{
            revalidateOnFocus: false,
            fetcher: (url: string) => fetch(url).then(res => res.json())
          }}
        >
          {children}
        </SWRConfig>
      </ToastProvider>
    </ThemeProvider>
  )
}