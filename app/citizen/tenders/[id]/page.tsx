import { getTenderById } from "@/app/actions/tender-actions"
import { CitizenLayout } from "@/components/citizen-layout"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Building2, 
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import Link from "next/link"
import { notFound } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default async function TenderDetailsPage({ params }: { params: { id: string } }) {
  try {
    const tender = await getTenderById(params.id)

    return (
      <CitizenLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Tender Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-[#4B0082] flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    {tender.title}
                  </h1>
                  <span className="text-sm text-gray-500 font-medium">
                    Ref: {tender.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-gray-700">
                  <p className="text-sm">{tender.description}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Issuer:</span> {tender.issuer.name} 
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Location:</span> {tender.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Closing Date:</span> {new Date(tender.closingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Budget:</span> Rs. {tender.budget?.toLocaleString() || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Accountability Section */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#4B0082] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Report Irregularities
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  If you notice any suspicious activities or potential misconduct related to this tender, 
                  please report it confidentially. Your input helps maintain transparency and integrity 
                  in the procurement process.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="mr-2 h-4 w-4" /> Report Irregularity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Tender Irregularity</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="name">Your Name (Optional)</Label>
                        <Input 
                          id="name" 
                          placeholder="Enter your name (optional)" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact Information (Optional)</Label>
                        <Input 
                          id="contact" 
                          placeholder="Email or phone (optional)" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="irregularity">Description of Irregularity</Label>
                        <Textarea 
                          id="irregularity" 
                          placeholder="Describe the irregularity you've observed" 
                          className="min-h-[100px]"
                          required 
                        />
                      </div>
                      <Button type="submit" variant="destructive" className="w-full">
                        Submit Report
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bidding Information */}
            <div className="space-y-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#4B0082]">Tender Overview</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-semibold
                      ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                        tender.status === 'CLOSED' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {tender.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Bids Received:</span>
                    <span>{tender.bids.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CitizenLayout>
    )
  } catch (error) {
    notFound()
  }
}