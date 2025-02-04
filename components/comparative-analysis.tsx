'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getTenderBids } from "@/app/actions/tender-actions"
import { formatCurrency } from "@/lib/utils"

interface ComparativeAnalysisProps {
  tenderId: string
  currentBidId: string
}

export function ComparativeAnalysis({ tenderId, currentBidId }: ComparativeAnalysisProps) {
  const [shortlistedBids, setShortlistedBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShortlistedBids = async () => {
      try {
        const bids = await getTenderBids(tenderId, {
          status: 'SHORTLISTED'
        })
        setShortlistedBids(bids)
      } catch (error) {
        console.error('Error fetching shortlisted bids:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShortlistedBids()
  }, [tenderId])

  const calculateRank = (score: number) => {
    const sortedScores = [...shortlistedBids]
      .sort((a, b) => b.evaluationScore - a.evaluationScore)
      .map(bid => bid.evaluationScore)
    return sortedScores.indexOf(score) + 1
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparative Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {shortlistedBids.map((bid) => (
              <div 
                key={bid.id} 
                className={`p-4 rounded-lg border ${
                  bid.id === currentBidId ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{bid.bidder.company}</h3>
                    <p className="text-sm text-gray-600">Bid Amount: {formatCurrency(bid.amount)}</p>
                  </div>
                  <Badge>Rank #{calculateRank(bid.evaluationScore)}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Score</span>
                      <span>{bid.technicalScore}%</span>
                    </div>
                    <Progress value={bid.technicalScore} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Financial Score</span>
                      <span>{bid.financialScore}%</span>
                    </div>
                    <Progress value={bid.financialScore} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span>{bid.evaluationScore}%</span>
                    </div>
                    <Progress value={bid.evaluationScore} className="bg-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 