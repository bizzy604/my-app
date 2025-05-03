'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { evaluateBid } from "@/app/actions/tender-actions"
import { BidStatus } from '@prisma/client'
import { getServerAuthSession } from '@/lib/auth'

interface FinalEvaluationFormProps {
  bid: any
  onComplete: () => void
}

export function FinalEvaluationForm({ bid, onComplete }: FinalEvaluationFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [scores, setScores] = useState({
    technical: bid.technicalScore || 0,
    financial: bid.financialScore || 0,
    experience: bid.experienceScore || 0
  })
  const [comments, setComments] = useState('')

  const weights = {
    technical: 0.5,    // 50%
    financial: 0.3,    // 30%
    experience: 0.2    // 20%
  }

  const calculateWeightedScore = () => {
    return (
      scores.technical * weights.technical +
      scores.financial * weights.financial +
      scores.experience * weights.experience
    )
  }

  useEffect(() => {
    // Get the current user ID when component mounts
    const getUserId = async () => {
      try {
        const session = await getServerAuthSession()
        if (session?.user?.id) {
          setUserId(session.user.id)
        }
      } catch (error) {
        console.error("Error getting user session:", error)
      }
    }
    
    getUserId()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userId) {
        throw new Error("User ID not available")
      }
      
      await evaluateBid(bid.id, {
        stage: 'FINAL',
        score: calculateWeightedScore(),
        comments,
        status: BidStatus.FINAL_EVALUATION,
        evaluatedBy: userId
      })

      toast({
        title: "Final evaluation completed",
        description: "The bid has been evaluated and is ready for award decision"
      })

      onComplete()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit final evaluation",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Technical Score ({weights.technical * 100}%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.technical}
                  onChange={(e) => setScores(prev => ({ ...prev, technical: Number(e.target.value) }))}
                />
                <Progress value={scores.technical} className="flex-1" />
              </div>
            </div>

            <div>
              <Label>Financial Score ({weights.financial * 100}%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.financial}
                  onChange={(e) => setScores(prev => ({ ...prev, financial: Number(e.target.value) }))}
                />
                <Progress value={scores.financial} className="flex-1" />
              </div>
            </div>

            <div>
              <Label>Experience Score ({weights.experience * 100}%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.experience}
                  onChange={(e) => setScores(prev => ({ ...prev, experience: Number(e.target.value) }))}
                />
                <Progress value={scores.experience} className="flex-1" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label>Final Weighted Score</Label>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{calculateWeightedScore().toFixed(2)}%</span>
                <Progress value={calculateWeightedScore()} className="flex-1 h-6" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evaluation Comments</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed comments about the final evaluation..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Final Evaluation'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
} 