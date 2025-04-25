import type { Metadata } from "next";
import "./globals.css";
import "swagger-ui-react/swagger-ui.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthProvider } from '@/components/next-auth-provider'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from '@/providers/query-provider'
import { Providers } from './providers'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Innobid",
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
            <QueryProvider>
              <NextAuthProvider>
                {children}
                <SpeedInsights />
              </NextAuthProvider>
            </QueryProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
