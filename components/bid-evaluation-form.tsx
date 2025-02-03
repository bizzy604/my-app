'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BidEvaluationFormProps {
  bid: {
    id: string
    tenderId: string
    currentScores?: {
      technicalScore: number
      financialScore: number
      experienceScore: number
      comments?: string
      evaluator?: string
    } | null
  }
  onComplete?: () => void
}

export function BidEvaluationForm({ bid, onComplete }: BidEvaluationFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scores, setScores] = useState({
    technical: bid.currentScores?.technicalScore?.toString() || '',
    financial: bid.currentScores?.financialScore?.toString() || '',
    experience: bid.currentScores?.experienceScore?.toString() || ''
  })
  const [comments, setComments] = useState(bid.currentScores?.comments || '')

  // Check if current user has already evaluated
  const hasEvaluated = bid.currentScores?.evaluatorId === session?.user?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to evaluate bids",
        variant: "destructive"
      })
      return
    }

    if (hasEvaluated) {
      toast({
        title: "Error",
        description: "You have already evaluated this bid",
        variant: "destructive"
      })
      return
    }

    // Validate scores
    const technicalScore = parseInt(scores.technical)
    const financialScore = parseInt(scores.financial)
    const experienceScore = parseInt(scores.experience)

    if (
      isNaN(technicalScore) || technicalScore < 0 || technicalScore > 100 ||
      isNaN(financialScore) || financialScore < 0 || financialScore > 100 ||
      isNaN(experienceScore) || experienceScore < 0 || experienceScore > 100
    ) {
      toast({
        title: "Error",
        description: "All scores must be numbers between 0 and 100",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bids/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId: bid.id,
          tenderId: bid.tenderId,
          technicalScore,
          financialScore,
          experienceScore,
          comments: comments.trim()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit evaluation')
      }

      toast({
        title: "Success",
        description: "Bid evaluation has been submitted successfully"
      })

      // Refresh the page data
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit evaluation",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasEvaluated) {
    return (
      <Alert className="bg-muted">
        <AlertDescription>
          You have already evaluated this bid. Your scores are:
          <br />
          Technical Score: {bid.currentScores?.technicalScore}%
          <br />
          Financial Score: {bid.currentScores?.financialScore}%
          <br />
          Experience Score: {bid.currentScores?.experienceScore}%
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="technical">Technical Score (0-100)</Label>
          <Input
            id="technical"
            type="number"
            min="0"
            max="100"
            value={scores.technical}
            onChange={(e) => setScores(prev => ({ ...prev, technical: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="financial">Financial Score (0-100)</Label>
          <Input
            id="financial"
            type="number"
            min="0"
            max="100"
            value={scores.financial}
            onChange={(e) => setScores(prev => ({ ...prev, financial: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="experience">Experience Score (0-100)</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            max="100"
            value={scores.experience}
            onChange={(e) => setScores(prev => ({ ...prev, experience: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="comments">Evaluation Comments</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your evaluation comments here..."
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
        </Button>
      </div>
    </form>
  )
}
