'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  technicalScore: z.coerce
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  financialScore: z.coerce
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  experienceScore: z.coerce
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  comments: z.string().optional(),
})

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicalScore: bid.currentScores?.technicalScore || 0,
      financialScore: bid.currentScores?.financialScore || 0,
      experienceScore: bid.currentScores?.experienceScore || 0,
      comments: bid.currentScores?.comments || "",
    },
  })

  // Check if current user has already evaluated
  const hasEvaluated = bid.currentScores?.evaluator === session?.user?.id

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/bids/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId: bid.id,
          tenderId: bid.tenderId,
          ...values
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate bid')
      }

      const totalScore = (
        (values.technicalScore * 0.4) +
        (values.financialScore * 0.4) +
        (values.experienceScore * 0.2)
      )

      let toastMessage = `Bid evaluated successfully. Total Score: ${totalScore.toFixed(2)}%`
      
      if (totalScore >= 80) {
        toastMessage += '. Bid has moved to final evaluation.'
      } else if (totalScore >= 70) {
        toastMessage += '. Bid has been shortlisted.'
      } else if (totalScore >= 60) {
        toastMessage += '. Bid is in technical evaluation.'
      }

      toast({
        title: "Evaluation Complete",
        description: toastMessage,
      })

      // Refresh the page data
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evaluate bid",
        variant: "destructive",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="technicalScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technical Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Score out of 100 (40% weight)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="financialScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Financial Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Score out of 100 (40% weight)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Score out of 100 (20% weight)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any comments about the evaluation..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Evaluating..." : "Submit Evaluation"}
        </Button>
      </form>
    </Form>
  )
}
