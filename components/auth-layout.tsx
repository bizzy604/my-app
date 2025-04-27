import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  isSignUp?: boolean
}

export function AuthLayout({ children, isSignUp = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/50">
      {/* Logo Section - Now at the top */}
      <div className="w-full flex justify-center pt-6 md:pt-10">
        <Link href="/" className="w-[150px] md:w-[200px] lg:w-[250px]">
          <Image
            src="/Innobid Logo.jpg"
            alt="InnoBid Logo"
            priority
            width={500}
            height={300}
            className="w-full h-auto rounded-xl"
          />
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[90%] md:max-w-[500px] bg-primary p-2 rounded-xl">
          <div className="w-full bg-card rounded-lg p-6 md:p-8">
            {children}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 md:gap-6 justify-center mt-8">
          <Link href="#" className="text-primary hover:opacity-80 transition-opacity">
            <Facebook size={16} className="md:w-5 md:h-5" />
          </Link>
          <Link href="#" className="text-primary hover:opacity-80 transition-opacity">
            <Twitter size={16} className="md:w-5 md:h-5" />
          </Link>
          <Link href="#" className="text-primary hover:opacity-80 transition-opacity">
            <Instagram size={16} className="md:w-5 md:h-5" />
          </Link>
          <Link href="#" className="text-primary hover:opacity-80 transition-opacity">
            <Youtube size={16} className="md:w-5 md:h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
