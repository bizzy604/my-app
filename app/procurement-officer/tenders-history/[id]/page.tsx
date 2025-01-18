import Image from "next/image"
import Link from "next/link"
import { Building2, ThumbsUp, ThumbsDown, Clock, ArrowLeft, Download, Mail } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// This would normally come from an API or database
const getBidDetails = (id: string) => ({
  id,
  applicant: "Nelson Mandela University Business School",
  proposedPrice: 16789123,
  status: 'pending' as const,
  submissionDate: "2024-01-08T14:30:00Z",
  tender: {
    title: "Provision of Short-Term Insurance Brokerage Services",
    reference: "TOO2/2023",
  },
  documents: [
    { name: "Technical Proposal", size: "2.4 MB", type: "PDF" },
    { name: "Financial Proposal", size: "1.8 MB", type: "PDF" },
    { name: "Company Registration", size: "500 KB", type: "PDF" },
    { name: "Tax Clearance", size: "300 KB", type: "PDF" },
  ],
  technicalProposal: `Our technical approach focuses on implementing a comprehensive insurance brokerage service that leverages our extensive experience in the industry. Key highlights include:

1. Risk Assessment and Analysis
- Detailed evaluation of current insurance portfolio
- Identification of potential risks and coverage gaps
- Custom risk management strategies

2. Insurance Program Design
- Tailored coverage solutions
- Cost-effective premium structures
- Innovative risk transfer mechanisms

3. Claims Management
- 24/7 claims support
- Streamlined claims processing
- Regular claims analysis and reporting`,
  experience: `- 15+ years in insurance brokerage
- Managed portfolios for 50+ municipal clients
- Successfully processed over 1000 claims
- Certified team of insurance professionals
- Strong relationships with major insurers`,
  contactPerson: {
    name: "Sarah Johnson",
    position: "Senior Insurance Broker",
    email: "sarah.johnson@nelsonmandela.ac.za",
    phone: "+27 123 456 789"
  }
})

export default function TenderBidDetailsPage({ params }: { params: { id: string } }) {
  const bid = getBidDetails(params.id)

  const getStatusIcon = (status: 'approved' | 'rejected' | 'pending') => {
    switch (status) {
      case 'approved':
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: 'approved' | 'rejected' | 'pending') => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'pending':
        return 'Pending Review'
    }
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/procurement-officer/tenders-history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Bid Details</h1>
            <p className="text-sm text-gray-600">Review submitted tender application</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">John Mwangi</p>
            <p className="text-sm text-gray-600">Procurement Officer, Ministry of Finance</p>
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

      <main className="p-8 space-y-6">
        {/* Tender and Bid Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tender</h3>
                  <p className="mt-1 text-lg font-medium">{bid.tender.title}</p>
                  <p className="text-sm text-gray-600">Reference: {bid.tender.reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Applicant</h3>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{bid.applicant}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bid Status</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(bid.status)}
                    <span className="font-medium">{getStatusText(bid.status)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Proposed Price</h3>
                  <p className="mt-1 text-lg font-medium">
                    Rs. {bid.proposedPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p className="mt-1">
                    {new Date(bid.submissionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Proposal */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{bid.technicalProposal}</div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Relevant Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{bid.experience}</div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {bid.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Download className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.size} • {doc.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Person */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{bid.contactPerson.name}</p>
                <p className="text-sm text-gray-600">{bid.contactPerson.position}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {bid.contactPerson.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bid.contactPerson.phone}
                  </div>
                </div>
              </div>
              <Button>Contact</Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            className="bg-[#4B0082] hover:bg-[#3B0062]"
            size="lg"
            asChild
          >
            <Link href={`/procurement-officer/tenders-history/${params.id}/award`}>
            Accept Bid
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50"
            size="lg"
          >
            Reject Bid
          </Button>
        </div>
      </main>
    </DashboardLayout>
  )
}