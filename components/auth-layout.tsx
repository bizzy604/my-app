import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  isSignUp?: boolean
}

export function AuthLayout({ children, isSignUp = false }: AuthLayoutProps) {
  return (
    <div className="flex w-auto min-h-screen bg-grey-200">
      <div className="flex flex-col justify-between p-8 w-1/3 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href="/" className="w-50">
            <Image
              src="/Innobid Logo.jpg"
              alt="InnoBid Logo"
              priority
              width={500}
              height={300}
              className="max-w-50 h-50"
            />
          </Link>
        </div>
        <div className="flex-grow"></div>
        <div className="flex gap-6 justify-center mt-auto">
          <Link href="#" className="text-[#4B0082]">
            <Facebook size={20} />
          </Link>
          <Link href="#" className="text-[#4B0082]">
            <Twitter size={20} />
          </Link>
          <Link href="#" className="text-[#4B0082]">
            <Instagram size={20} />
          </Link>
          <Link href="#" className="text-[#4B0082]">
            <Youtube size={20} />
          </Link>
        </div>
      </div>
      <div className={`flex items-center justify-center ${isSignUp ? 'w-2/3 bg-[#4B0082]' : 'w-2/3 bg-[#4B0082]'}`}>
        <div className={`w-full max-w-[800px] mx-auto ${isSignUp ? 'bg-white rounded-lg' : 'rounded-lg bg-white'} p-12`}>
          {children}
        </div>
      </div>
    </div>
  )
}
