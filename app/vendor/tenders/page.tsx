import Image from "next/image"
import { VendorLayout } from "@/components/vendor-layout"
import { VendorTenderCard } from "@/components/vendor-tender"

const tenders = [
  {
    id: "1",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  },
  {
    id: "2",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  },
  {
    id: "3",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  },
  {
    id: "4",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  },
  {
    id: "5",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  },
  {
    id: "6",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "Friday, 12 August 2023 - 12:00",
  }
]

export default function TendersPage() {
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
      <main className="p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <VendorTenderCard key={tender.id} {...tender} />
          ))}
        </div>
      </main>
    </VendorLayout>
  )
}