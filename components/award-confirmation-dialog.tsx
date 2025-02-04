'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trophy, AlertTriangle } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface AwardConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (notificationMessage: string) => Promise<void>
  bid: any
}

export function AwardConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  bid
}: AwardConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState(
    `Congratulations! Your bid for tender ${bid.tender.title} has been accepted. The contract amount is ${formatCurrency(bid.amount)}.`
  )

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(notificationMessage)
      onClose()
    } catch (error) {
      console.error('Error confirming award:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Confirm Tender Award
          </DialogTitle>
          <DialogDescription>
            Please review the award details and customize the notification message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold">{bid.bidder.company}</h3>
            <p className="text-sm text-gray-600">
              Bid Amount: {formatCurrency(bid.amount)}
            </p>
            <p className="text-sm text-gray-600">
              Final Score: {bid.evaluationScore}%
            </p>
          </div>

          <div className="space-y-2">
            <Label>Award Notification Message</Label>
            <Textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={4}
            />
          </div>

          {bid.evaluationScore < 70 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md text-red-600">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <p className="text-sm">
                Warning: This bid's score is below the recommended threshold of 70%.
                Please ensure you have proper justification for this award.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Award'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 