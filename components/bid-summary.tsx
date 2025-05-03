'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface BidSummaryProps {
  bids: Array<{
    id: string
    amount: number
    status: string
    bidder: {
      name: string
      company: string
    }
    evaluationScore?: number
    technicalScore?: number
    financialScore?: number
  }>
}

export function BidSummary({ bids }: BidSummaryProps) {
  const averageBid = bids.reduce((acc, bid) => acc + bid.amount, 0) / bids.length
  const lowestBid = Math.min(...bids.map(bid => bid.amount))
  const highestBid = Math.max(...bids.map(bid => bid.amount))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(averageBid)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lowest Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(lowestBid)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Highest Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(highestBid)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{bid.bidder.company}</p>
                  <p className="text-sm text-gray-600">{bid.bidder.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(bid.amount)}</p>
                  <Badge 
                    variant={getBidStatusVariant(bid.status)}
                    className={bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                  >
                    {bid.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getBidStatusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case 'ACCEPTED':
      return 'secondary'
    case 'REJECTED':
      return 'destructive'
    default:
      return 'default'
  }
} 