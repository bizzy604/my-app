import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import InnobidLogo from "@/public/Innobid Logo.jpg"

interface AuthLayoutProps {
  children: React.ReactNode
  isSignUp?: boolean
}

export function AuthLayout({ children, isSignUp = false }: AuthLayoutProps) {
  return (
    <div className="flex w-auto min-h-screen bg-grey-200">
      <div className="flex-col justify-center items-center p-8">
        <Link href="/" className="w-50">
          <Image
            src={InnobidLogo}
            alt="InnoBid Logo"
            priority
            className="max-w-50 h-50 justify-center items-center"
          />
        </Link>
        <div className="flex gap-6 mt-auto">
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
      <div className={`flex w-2/3 items-center justify-center ${isSignUp ? 'bg-[#4B0082]' : 'bg-[#4B0082]'}`}>
        <div className={`w-auto max-w-[1000px] mx-auto ${isSignUp ? 'bg-white rounded-lg' : 'rounded-lg bg-white'} p-8`}>
          {children}
        </div>
      </div>
    </div>
  )
}

