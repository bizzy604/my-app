'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { evaluateBid } from "@/app/actions/tender-actions"
import { BidStatus } from '@prisma/client'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { BidWithDetails } from '@/types/bid'

interface EvaluationStage {
  id: string
  name: string
  description: string
  status: 'pending' | 'current' | 'completed'
  score?: number
  maxScore: number
  criteria: Array<{
    name: string
    weight: number
    score?: number
  }>
}

export function EvaluationStages({ bid, onEvaluationComplete }: { 
  bid: BidWithDetails
  onEvaluationComplete: () => void 
}) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState<string>(bid.evaluationStage || 'INITIAL')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper function to determine stage status without depending on stages array
  function determineStageStatus(stageId: string): 'pending' | 'current' | 'completed' {
    const allStages = ['INITIAL', 'TECHNICAL', 'FINANCIAL', 'FINAL']
    const stageIndex = allStages.indexOf(stageId)
    const currentIndex = allStages.indexOf(currentStage)
    
    if (stageIndex < currentIndex) return 'completed'
    if (stageIndex === currentIndex) return 'current'
    return 'pending'
  }

  const stages: EvaluationStage[] = [
    {
      id: 'INITIAL',
      name: 'Initial Review',
      description: 'Review submitted documents and basic eligibility',
      status: determineStageStatus('INITIAL'),
      maxScore: 100,
      criteria: [
        { name: 'Document Completeness', weight: 50 },
        { name: 'Basic Eligibility', weight: 50 }
      ]
    },
    {
      id: 'TECHNICAL',
      name: 'Technical Evaluation',
      description: 'Evaluate technical capabilities and proposal',
      status: determineStageStatus('TECHNICAL'),
      maxScore: 100,
      criteria: [
        { name: 'Technical Capability', weight: 40 },
        { name: 'Experience', weight: 30 },
        { name: 'Methodology', weight: 30 }
      ]
    },
    {
      id: 'FINANCIAL',
      name: 'Financial Evaluation',
      description: 'Evaluate financial proposal and bid amount',
      status: determineStageStatus('FINANCIAL'),
      maxScore: 100,
      criteria: [
        { name: 'Price Competitiveness', weight: 50 },
        { name: 'Financial Stability', weight: 50 }
      ]
    },
    {
      id: 'FINAL',
      name: 'Final Evaluation',
      description: 'Overall evaluation and recommendation',
      status: determineStageStatus('FINAL'),
      maxScore: 100,
      criteria: [
        { name: 'Technical Score', weight: 70 },
        { name: 'Financial Score', weight: 30 }
      ]
    }
  ]

  function getNextStatus(currentStageId: string): BidStatus {
    switch (currentStageId) {
      case 'INITIAL':
        return BidStatus.TECHNICAL_EVALUATION
      case 'TECHNICAL':
        return BidStatus.SHORTLISTED
      case 'FINANCIAL':
        return BidStatus.COMPARATIVE_ANALYSIS
      case 'FINAL':
        return BidStatus.FINAL_EVALUATION
      default:
        return BidStatus.UNDER_REVIEW
    }
  }

  const handleEvaluate = async (stageId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to evaluate bids",
        variant: "destructive"
      })
      return
    }

    // Validate scores
    const stageScores = Object.values(scores)
    if (stageScores.length === 0) {
      toast({
        title: "Error",
        description: "Please enter scores for all criteria",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate total score for the stage
      const averageScore = stageScores.reduce((a, b) => a + b, 0) / stageScores.length

      await evaluateBid(bid.id, {
        stage: stageId,
        score: averageScore,
        comments,
        status: getNextStatus(stageId),
        evaluatedBy: parseInt(session.user.id)
      })
      
      toast({
        title: "Evaluation saved",
        description: "The bid has been evaluated and moved to the next stage"
      })
      
      // Refresh the page data
      router.refresh()
      
      // Call the completion handler
      onEvaluationComplete()
    } catch (error) {
      console.error('Evaluation error:', error)
      let errorMessage = 'Failed to save evaluation. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {stages.map((stage) => (
        <Card key={stage.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {stage.status === 'completed' && <CheckCircle className="text-green-500" />}
                {stage.status === 'current' && <Clock className="text-blue-500" />}
                {stage.status === 'pending' && <AlertCircle className="text-gray-400" />}
                {stage.name}
              </CardTitle>
              {stage.status === 'completed' && (
                <Badge variant="success">
                  Score: {stage.score || 0}/{stage.maxScore}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
            
            {stage.status === 'current' && (
              <div className="space-y-4">
                {stage.criteria.map((criterion) => (
                  <div key={criterion.name} className="space-y-2">
                    <Label>
                      {criterion.name} ({criterion.weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Score"
                      onChange={(e) => {
                        const newScores = { ...scores }
                        newScores[criterion.name] = Number(e.target.value)
                        setScores(newScores)
                      }}
                    />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add evaluation comments..."
                  />
                </div>

                <Button
                  onClick={() => handleEvaluate(stage.id)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Evaluation'}
                </Button>
              </div>
            )}

            {stage.status === 'completed' && (
              <div className="space-y-2">
                <Progress value={(stage.score || 0) / stage.maxScore * 100} />
                <p className="text-sm text-gray-600">{stage.comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 