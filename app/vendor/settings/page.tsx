import { VendorLayout } from "@/components/vendor-layout"
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <VendorLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Manage your account preferences</p>
        </div>
        <Settings className="h-8 w-8 text-[#4B0082]" />
      </header>
      <main className="p-8">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-gray-600">No settings available to configure.</p>
        </div>
      </main>
    </VendorLayout>
  )
}

