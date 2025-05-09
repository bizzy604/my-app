import type { Metadata as NextMetadata } from "next/types";
type Metadata = NextMetadata;
import "./fonts.css"; // Import direct font CSS first
import "./globals.css";
import "swagger-ui-react/swagger-ui.css";
import { Poppins } from "next/font/google";
import { NextAuthProvider } from '@/components/next-auth-provider'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from '@/providers/query-provider'
import { Providers } from './providers'
import { BrowserCompatibilityProvider } from '@/components/browser-compatibility-provider'

// Load Poppins font with all necessary weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap', // Ensure text remains visible during font loading
});

// Define metadata for the root layout
export const metadata = {
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
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
            <QueryProvider>
              <NextAuthProvider>
                <BrowserCompatibilityProvider>
                  {children}
                  <SpeedInsights />
                </BrowserCompatibilityProvider>
              </NextAuthProvider>
            </QueryProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
