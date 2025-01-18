import Link from "next/link"
import { Bookmark, FileText } from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Button } from "@/components/ui/button"

export default function TenderDetailsPage({ params }: { params: { id: string } }) {
  // This would normally come from an API call using the ID
  const tender = {
    title: "Provision of Short-Term Insurance Brokerage Services",
    issueDate: "Friday, July 22, 2022 - 09:00",
    closingDate: "Friday, August 12, 2022 - 12:00",
    reference: "TOO2/2023",
    location: "Munich, Germany",
    description: `MANAGEMENT OF SHORT-TERM INSURANCE PORTFOLIO

Tenders are hereby invited from insurance brokers to manage the short-term insurance portfolio of the Kai !Garib Municipality for a period of 24 months, with the option to extend the contract on an annual basis up to a maximum period of 36 months.

Tenders must be submitted on the original documents and remain valid for ninety (90) days after the closing date of the tender.

A set of tender documents can be obtained from Mr. Gavin Matthews who may be contacted at telephone (079) 590 2053 OR it can be obtained via gmholdings21@gmail.com/matthewsg@kaigarib.gov.za if after a non-refundable fee of R500.00 is paid.

Fully completed tender documents must be placed in a sealed envelope and placed in the tender box at the Kai !Garib Municipal Building,09 Main Road, Keimoes, Northern Cape by no later than 12:00 on Friday, 12 August 2022 or at Archive Date. The envelopes must be endorsed clearly with the number, title, and closing date of the tender as above.

The tender will be evaluated on the 80/20 Preference Points system as prescribed by the Preferential Procurement Regulations, 2022.

No tender box will be emptied out after 12:00 on the closing date as above, hereafter all bids will be opened in public. Late tenders or tenders submitted by e-mail or fax will under no circumstances be accepted.

The Municipality reserves the right to withdraw any invitation to tender and/or to re-advertise or to reject any tender or to accept a part of it. The Municipality does not bind itself to accept the lowest tender or award a contract to the bidder scoring the highest number of points.

It is expected of all Bidders who are not yet registered on National Treasury's Central Supplier Database (CSD) to register without delay on the prescribed form. The Municipality reserves the right not to award tenders to Bidders who are not registered on the CSD.

NB: The following supporting documents are to include in the tender submission:
• Company Profile
• Certified copies of ID's of all Directors
• A copy of the company founding statement
• A valid original SARS Tax Clearance Certificate
• B-BBEE Certificate-original or Certified
• Current Municipal account
• Central Supplier Database Registration proof

Bidder shall take note of the following Bid Documents
• The Kai !Garib Municipality Supply Chain Policy will apply
• The Municipality does not bind itself to accept the lowest bid or any other bid and reserves the right to accept the whole part of the bid`,
  }

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
          <div className="relative h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </header>
      <main className="p-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-[#4B0082]">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#4B0082]">{tender.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                className="bg-[#4B0082] text-white hover:bg-[#3B0062]"
                asChild
              >
                <Link href={`/vendor/tenders/${params.id}/bid`}>Bid Now</Link>
              </Button>
              <Button variant="outline" size="icon">
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Bookmark tender</span>
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <dl className="grid gap-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-900">Issue Date:</dt>
                <dd className="text-gray-700">{tender.issueDate}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-900">Closing Date:</dt>
                <dd className="text-gray-700">{tender.closingDate}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-900">Tender Reference:</dt>
                <dd className="text-gray-700">{tender.reference}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-900">Location:</dt>
                <dd className="text-gray-700">{tender.location}</dd>
              </div>
            </dl>
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{tender.description}</div>
          </div>
        </div>
      </main>
    </VendorLayout>
  )
}