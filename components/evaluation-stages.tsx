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
import { formatDate } from "@/lib/utils"

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
  comments?: string | null
}

interface EvaluationStagesProps {
  bid: {
    id: string
    tenderId: string
    currentScores: {
      technicalScore: number
      financialScore: number
      experienceScore: number
      comments?: string
    } | null
  }
  onEvaluationComplete: () => void
}

export function EvaluationStages({ bid, onEvaluationComplete }: EvaluationStagesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStageVariant = (status: 'pending' | 'current' | 'completed') => {
    switch (status) {
      case 'completed':
        return "default"
      case 'current':
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const scores = {
        technicalScore: Number(formData.get('technicalScore')),
        financialScore: Number(formData.get('financialScore')),
        experienceScore: Number(formData.get('experienceScore')),
        comments: formData.get('comments')?.toString()
      }
      // Calculate average score across criteria
      const averageScore = (scores.technicalScore + scores.financialScore + scores.experienceScore) / 3

      await evaluateBid(
        bid.id,
        {
          stage: 'FINAL',
          score: averageScore,
          comments: scores.comments,
          status: BidStatus.UNDER_REVIEW,
          evaluatedBy: session?.user?.id as number
        }
      )

      toast({
        title: "Evaluation submitted",
        description: "The bid has been evaluated successfully."
      })

      onEvaluationComplete()
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    return null
  }

  if (bid.currentScores) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Evaluation Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Technical Score</Label>
              <div className="mt-1">
                <Progress value={bid.currentScores.technicalScore} />
                <span className="text-sm text-muted-foreground">
                  {bid.currentScores.technicalScore}%
                </span>
              </div>
            </div>
            <div>
              <Label>Financial Score</Label>
              <div className="mt-1">
                <Progress value={bid.currentScores.financialScore} />
                <span className="text-sm text-muted-foreground">
                  {bid.currentScores.financialScore}%
                </span>
              </div>
            </div>
            <div>
              <Label>Experience Score</Label>
              <div className="mt-1">
                <Progress value={bid.currentScores.experienceScore} />
                <span className="text-sm text-muted-foreground">
                  {bid.currentScores.experienceScore}%
                </span>
              </div>
            </div>
            {bid.currentScores.comments && (
              <div>
                <Label>Comments</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bid.currentScores.comments}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const stages: EvaluationStage[] = [
    {
      id: 'INITIAL',
      name: 'Initial Review',
      description: 'Review submitted documents and basic eligibility',
      status: 'pending',
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
      status: 'pending',
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
      status: 'pending',
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
      status: 'pending',
      maxScore: 100,
      criteria: [
        { name: 'Technical Score', weight: 70 },
        { name: 'Financial Score', weight: 30 }
      ]
    }
  ]

  const [currentStage, setCurrentStage] = useState<string>('INITIAL')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')

  const determineStageStatus = (stageId: string): 'pending' | 'current' | 'completed' => {
    const allStages = ['INITIAL', 'TECHNICAL', 'FINANCIAL', 'FINAL']
    const stageIndex = allStages.indexOf(stageId)
    const currentIndex = allStages.indexOf(currentStage)
    
    if (stageIndex < currentIndex) return 'completed'
    if (stageIndex === currentIndex) return 'current'
    return 'pending'
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

      await evaluateBid(
        bid.id,
        {
          stage: stageId,
          score: averageScore,
          comments,
          status: BidStatus.UNDER_REVIEW,
          evaluatedBy: session.user.id
        }
      )
      
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
                <Badge variant={getStageVariant(stage.status)}>
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