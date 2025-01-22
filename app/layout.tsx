import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { NextAuthProvider } from '@/components/next-auth-provider'
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Innobid",
  description: "Innobid E-Procurement System",
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
    <html lang="en" className={`${poppins.variable}`}>
      <body className={poppins.variable}>
        <NextAuthProvider>
          {children}
          <SpeedInsights />
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
