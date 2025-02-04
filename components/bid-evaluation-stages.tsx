import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { evaluateBid } from "@/app/actions/tender-actions"
import { BidStatus } from '@prisma/client'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface EvaluationStagesProps {
  bid: {
    id: string
    status: string
    evaluationLogs?: Array<{
      stage: string
      totalScore: number
      comments: string
      evaluatedBy: {
        name: string
      }
      createdAt: string
    }>
  }
  onEvaluationComplete: () => void
  currentUserId: number
}

export function BidEvaluationStages({ bid, onEvaluationComplete, currentUserId }: EvaluationStagesProps) {
  const { toast } = useToast()
  const [score, setScore] = useState('')
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStageStatus = (stageName: string) => {
    const log = bid.evaluationLogs?.find(l => l.stage === stageName)
    if (log) return 'completed'
    if (bid.status === 'SHORTLISTED' && stageName === 'FINAL_EVALUATION') return 'current'
    if (bid.status === 'PENDING' && stageName === 'FIRST_EVALUATION') return 'current'
    return 'pending'
  }

  const handleEvaluate = async (stage: string) => {
    try {
      setIsSubmitting(true)
      await evaluateBid({
        bidId: bid.id,
        stage,
        score: parseFloat(score),
        comments,
        evaluatedBy: currentUserId
      })
      
      toast({
        title: "Evaluation Submitted",
        description: "The bid has been successfully evaluated.",
      })
      
      onEvaluationComplete()
      setScore('')
      setComments('')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit evaluation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* First Evaluation Stage */}
          <div className="relative flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${getStageStatus('FIRST_EVALUATION') === 'completed' ? 'bg-green-100' : 
                getStageStatus('FIRST_EVALUATION') === 'current' ? 'bg-yellow-100' : 'bg-gray-100'}
            `}>
              {getStageStatus('FIRST_EVALUATION') === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : getStageStatus('FIRST_EVALUATION') === 'current' ? (
                <Clock className="w-5 h-5 text-yellow-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium">Initial Evaluation</h3>
              {getStageStatus('FIRST_EVALUATION') === 'current' && (
                <div className="mt-4 space-y-4">
                  <Input
                    type="number"
                    placeholder="Score (0-100)"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  <Textarea
                    placeholder="Evaluation comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleEvaluate('FIRST_EVALUATION')}
                    disabled={isSubmitting}
                  >
                    Submit Evaluation
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Final Evaluation Stage */}
          <div className="relative flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${getStageStatus('FINAL_EVALUATION') === 'completed' ? 'bg-green-100' : 
                getStageStatus('FINAL_EVALUATION') === 'current' ? 'bg-yellow-100' : 'bg-gray-100'}
            `}>
              {getStageStatus('FINAL_EVALUATION') === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : getStageStatus('FINAL_EVALUATION') === 'current' ? (
                <Clock className="w-5 h-5 text-yellow-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium">Final Evaluation</h3>
              {getStageStatus('FINAL_EVALUATION') === 'current' && (
                <div className="mt-4 space-y-4">
                  <Input
                    type="number"
                    placeholder="Score (0-100)"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  <Textarea
                    placeholder="Evaluation comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleEvaluate('FINAL_EVALUATION')}
                    disabled={isSubmitting}
                  >
                    Submit Final Evaluation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 