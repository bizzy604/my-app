import { Check } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"

export default function BidSuccessPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <div className="relative">
              <Check className="absolute -left-4 h-8 w-8 rotate-45 transform text-green-500" />
              <Check className="absolute -right-4 h-8 w-8 -rotate-45 transform text-green-500" />
            </div>
          </div>
          <h2 className="mb-2 text-sm font-medium text-green-500">Bid Pricing in Range!</h2>
          <p className="text-xl font-semibold text-gray-900">Your bid has been posted</p>
        </div>
      </main>
    </DashboardLayout>
  )
}

