import { DashboardLayout } from "@/components/dashboard-layout"
import { BookOpen } from 'lucide-react'

export default function ResourceCenterPage() {
  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resource Center</h1>
          <p className="text-sm text-gray-600">Access helpful resources and documentation</p>
        </div>
        <BookOpen className="h-8 w-8 text-[#4B0082]" />
      </header>
      <main className="p-8">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-gray-600">No resources available at the moment.</p>
        </div>
      </main>
    </DashboardLayout>
  )
}

