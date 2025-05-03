'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface AwardRecommendationProps {
  bid: any
  onAward: () => void
}

export function AwardRecommendation({ bid, onAward }: AwardRecommendationProps) {
  const getRecommendationStatus = (score: number) => {
    if (score >= 85) return 'highly-recommended'
    if (score >= 70) return 'recommended'
    return 'not-recommended'
  }

  const recommendationStatus = getRecommendationStatus(bid.evaluationScore)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Award Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{bid.bidder.company}</h3>
            <p className="text-sm text-gray-600">Bid Amount: {formatCurrency(bid.amount)}</p>
          </div>
          <Badge
            variant={
              recommendationStatus === 'highly-recommended' ? 'secondary' :
              recommendationStatus === 'recommended' ? 'outline' : 'destructive'
            }
            className={
              recommendationStatus === 'highly-recommended' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
              recommendationStatus === 'recommended' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''
            }
          >
            {recommendationStatus === 'highly-recommended' && (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            {recommendationStatus === 'not-recommended' && (
              <AlertTriangle className="h-4 w-4 mr-1" />
            )}
            {recommendationStatus.replace('-', ' ')}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Technical Score:</span>
            <span className="font-medium">{bid.technicalScore}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Financial Score:</span>
            <span className="font-medium">{bid.financialScore}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Experience Score:</span>
            <span className="font-medium">{bid.experienceScore}%</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Final Score:</span>
            <span>{bid.evaluationScore}%</span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={onAward}
            className="w-full"
            variant={recommendationStatus === 'not-recommended' ? 'destructive' : 'default'}
          >
            Proceed with Award
          </Button>
          {recommendationStatus === 'not-recommended' && (
            <p className="text-sm text-red-500 mt-2">
              Warning: This bid does not meet the minimum score requirements
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 