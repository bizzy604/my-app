'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { FinalEvaluationPanel } from "./final-evaluation-panel"

interface ShortlistedBidsPanelProps {
  tenderId: string
  bids: Array<{
    id: string
    amount: number
    status: string
    score: number
    bidder: {
      name: string
      company: string
    }
    evaluationStages: Array<{
      stage: string
      score: number
      comments: string
    }>
  }>
}

export function ShortlistedBidsPanel({ tenderId, bids }: ShortlistedBidsPanelProps) {
  const [showFinalEvaluation, setShowFinalEvaluation] = useState(false)

  if (showFinalEvaluation) {
    return <FinalEvaluationPanel tenderId={tenderId} shortlistedBids={bids} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shortlisted Bids</CardTitle>
          <Button onClick={() => setShowFinalEvaluation(true)}>
            Proceed to Final Evaluation
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bids.map((bid) => (
              <div key={bid.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{bid.bidder.company}</h3>
                    <p className="text-sm text-gray-500">{bid.bidder.name}</p>
                  </div>
                  <Badge>{formatCurrency(bid.amount)}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span>{bid.score}%</span>
                    </div>
                    <Progress value={bid.score} />
                  </div>

                  {bid.evaluationStages.map((stage, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-gray-600">{stage.comments}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 