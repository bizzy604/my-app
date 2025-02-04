import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthProvider } from '@/components/next-auth-provider'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from '@/providers/query-provider'
import { Providers } from './providers'

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "InnoBid",
  description: "Streamline your procurement process with InnoBid",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/android.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable}`} suppressHydrationWarning>
      <body className={poppins.variable}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <NextAuthProvider>
                {children}
                <SpeedInsights />
              </NextAuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
