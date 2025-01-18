import Link from "next/link"
import { type LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export function DashboardCard({ title, description, href, icon: Icon }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center rounded-lg bg-gray-50 p-6 text-center transition-colors hover:bg-gray-100"
    >
      <Icon className="mb-4 h-8 w-8 text-[#4B0082]" />
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}