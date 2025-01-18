import Link from "next/link"
import { MapPin, Bookmark, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface TenderCardProps {
  id: string
  title: string
  sector: string
  location: string
  issuer: string
  description: string
  closingDate: string
}

export function VendorTenderCard({
  id,
  title,
  sector,
  location,
  issuer,
  description,
  closingDate,
}: TenderCardProps) {
  return (
    <Card className="overflow-hidden bg-white">
      <Link href={`/vendor/tenders/${id}`}>
        <CardHeader className="p-4">
          <div className="flex h-48 w-full items-center justify-center bg-gray-100">
            <FileText className="h-20 w-20 text-[#4B0082]" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-bold text-[#4B0082]">{title}</h3>
            <p className="text-sm text-gray-600">Sector: {sector}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Issuer: {issuer}</p>
              <p className="text-sm text-gray-600">Tender Description:</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <p className="text-sm text-gray-600">
              Closing date and time: {closingDate}
            </p>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <Button 
          className="bg-[#4B0082] text-white hover:bg-[#3B0062]"
          size="sm"
          asChild
        >
          <Link href={`/vendor/tenders/${id}`}>More Details</Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bookmark className="h-4 w-4" />
          <span className="sr-only">Save tender</span>
        </Button>
      </CardFooter>
    </Card>
  )
}