import Image from "next/image"
import { VendorLayout } from "@/components/vendor-layout"

export default function BidLoadingPage() {
  return (
    <VendorLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tenders</h1>
          <p className="text-sm text-gray-600">View all available tender offers here</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">Amoni Kevin</p>
            <p className="text-sm text-gray-600">C.E.O, Eagles Limited Company</p>
          </div>
          <div className="relative h-12 w-12">
            <Image
              src="/placeholder.svg"
              alt="Profile picture"
              fill
              className="rounded-full object-cover"
            />
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16 animate-spin">
            <svg
              className="absolute inset-0"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                className="text-gray-200"
              />
              <path
                d="M50 5A45 45 0 0 1 95 50"
                stroke="#4B0082"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-900">
            Your bid&apos;s proposed price is being assessed by our models,
          </p>
          <p className="text-sm text-gray-600">please give us a moment</p>
        </div>
      </main>
    </VendorLayout>
  )
}

