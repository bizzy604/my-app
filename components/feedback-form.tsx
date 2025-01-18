'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from 'lucide-react'
import { submitFeedback } from "@/app/actions/feedback-action"

export function FeedbackForm({ tenderId, userId }: { tenderId: string, userId: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitFeedback(tenderId, userId, rating, comment)
      setRating(0)
      setComment('')
      // You might want to show a success message here
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // You might want to show an error message here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating">Rating</Label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              <Star className="h-6 w-6 fill-current" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts on the tender process..."
          rows={4}
        />
      </div>
      <Button 
        type="submit" 
        className="bg-[#4B0082] hover:bg-[#3B0062] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  )
}

