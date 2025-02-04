import Link from "next/link"
import { MapPin, Bookmark, FileText, Edit, Trash, Calendar, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tender {
  id: string
  title: string
  description: string
  sector: string
  location: string
  issuer: string
  status: string
  budget: number
  closingDate: string
}

interface TenderCardProps {
  tender: Tender
  onEdit?: () => void
  onDelete?: () => void
}

export function TenderCard({ tender, onEdit, onDelete }: TenderCardProps) {
  const {
    id,
    title,
    description,
    sector,
    location,
    status,
    budget,
    closingDate
  } = tender

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow",
        "border border-gray-200"
      )}
    >
      <Link href={`/procurement-officer/tenders/${id}`} className="flex-1">
        <CardHeader className="p-3 md:p-4">
          <div className="flex h-32 md:h-48 w-full items-center justify-center bg-gray-100 rounded-lg">
            <FileText className="h-16 md:h-24 w-16 md:w-24 text-[#4B0082]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#4B0082] line-clamp-1">
              {title}
            </h3>
            <Badge variant={
              status === 'OPEN' ? 'default' :
              status === 'CLOSED' ? 'secondary' :
              status === 'AWARDED' ? 'success' :
              'outline'
            }>
              {status}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{budget?.toLocaleString() ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <Calendar className="h-4 w-4" />
              <span>
                Closes {new Date(closingDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
      {(onEdit || onDelete) && (
        <CardFooter className="flex items-center justify-between border-t p-3 md:p-4 gap-2">
          <div className="flex space-x-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit}
                className="text-xs md:text-sm"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDelete}
                className="text-xs md:text-sm"
              >
                <Trash className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">Save tender</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}