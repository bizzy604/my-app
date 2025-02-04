'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EvaluationDetailsProps {
  bid: {
    id: string
    technicalScore?: number
    financialScore?: number
    experienceScore?: number
    evaluationScore?: number
    evaluationComments?: string
    evaluationDetails?: {
      criteria: Array<{
        name: string
        score: number
        maxScore: number
        weight: number
        comments?: string
      }>
    }
  }
}

export function EvaluationDetails({ bid }: EvaluationDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bid.technicalScore !== undefined && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Technical Score</span>
                  <span className="text-sm text-gray-600">{bid.technicalScore}%</span>
                </div>
                <Progress value={bid.technicalScore} />
              </div>
            )}
            
            {bid.financialScore !== undefined && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Financial Score</span>
                  <span className="text-sm text-gray-600">{bid.financialScore}%</span>
                </div>
                <Progress value={bid.financialScore} />
              </div>
            )}
            
            {bid.experienceScore !== undefined && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Experience Score</span>
                  <span className="text-sm text-gray-600">{bid.experienceScore}%</span>
                </div>
                <Progress value={bid.experienceScore} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {bid.evaluationDetails?.criteria && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bid.evaluationDetails.criteria.map((criterion, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{criterion.name}</span>
                    <span className="text-sm text-gray-600">
                      {criterion.score}/{criterion.maxScore} ({criterion.weight}%)
                    </span>
                  </div>
                  <Progress value={(criterion.score / criterion.maxScore) * 100} />
                  {criterion.comments && (
                    <p className="text-sm text-gray-600 mt-1">{criterion.comments}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {bid.evaluationComments && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{bid.evaluationComments}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 