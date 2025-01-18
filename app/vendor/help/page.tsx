import { DashboardLayout } from "@/components/dashboard-layout"
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help</h1>
          <p className="text-sm text-gray-600">Get assistance and support</p>
        </div>
        <HelpCircle className="h-8 w-8 text-[#4B0082]" />
      </header>
      <main className="p-8">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-gray-600">Help center content coming soon.</p>
        </div>
      </main>
    </DashboardLayout>
  )
}