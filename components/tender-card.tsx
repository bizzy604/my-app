import Link from "next/link"
import { MapPin, Bookmark, FileText, Edit, Trash } from 'lucide-react'
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
  onEdit: () => void
  onDelete: () => void
}

export function TenderCard({
  id,
  title,
  sector,
  location,
  issuer,
  description,
  closingDate,
  onEdit,
  onDelete
}: TenderCardProps) {
  return (
    <Card className="overflow-hidden bg-white">
      <Link href={`/procurement-officer/tenders/${id}`}>
        <CardHeader className="p-4">
          <div className="flex h-48 w-full items-center justify-center bg-gray-100">
            <FileText className="h-24 w-24 text-[#4B0082]" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#4B0082]">{title}</h3>
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
              Closing date and time: {new Date(closingDate).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bookmark className="h-4 w-4" />
          <span className="sr-only">Save tender</span>
        </Button>
      </CardFooter>
    </Card>
  )
}