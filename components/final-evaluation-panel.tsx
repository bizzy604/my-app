'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface FinalEvaluationPanelProps {
  tenderId: string
  shortlistedBids: Array<{
    id: string
    amount: number
    status: string
    technicalScore: number
    financialScore: number
    experienceScore: number
    bidder: {
      name: string
      company: string
    }
  }>
}

export function FinalEvaluationPanel({ tenderId, shortlistedBids }: FinalEvaluationPanelProps) {
  const { toast } = useToast()
  const [selectedBidId, setSelectedBidId] = useState<string>('')
  const [evaluations, setEvaluations] = useState<Record<string, { 
    totalScore: number
    comments: string 
  }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAward = async () => {
    if (!selectedBidId) {
      toast({
        title: "Error",
        description: "Please select a winning bid",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bids/final-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId,
          winningBidId: selectedBidId,
          evaluations
        })
      })

      if (!response.ok) throw new Error('Failed to complete award process')

      toast({
        title: "Success",
        description: "Tender has been awarded successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the award process",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Evaluation & Award</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {shortlistedBids.map((bid) => (
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
                      <span>Experience Score</span>
                      <span>{bid.experienceScore}%</span>
                    </div>
                    <Progress value={bid.experienceScore} />
                  </div>

                  <Textarea
                    placeholder="Evaluation comments..."
                    value={evaluations[bid.id]?.comments || ''}
                    onChange={(e) => setEvaluations(prev => ({
                      ...prev,
                      [bid.id]: {
                        ...prev[bid.id],
                        comments: e.target.value,
                        totalScore: (bid.technicalScore * 0.4) + 
                                  (bid.financialScore * 0.4) + 
                                  (bid.experienceScore * 0.2)
                      }
                    }))}
                  />

                  <Button
                    variant={selectedBidId === bid.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedBidId(bid.id)}
                  >
                    {selectedBidId === bid.id ? "Selected for Award" : "Select as Winner"}
                  </Button>
                </div>
              </div>
            ))}

            <Button
              className="w-full"
              disabled={isSubmitting || !selectedBidId}
              onClick={handleAward}
            >
              {isSubmitting ? "Processing Award..." : "Complete Award Process"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 