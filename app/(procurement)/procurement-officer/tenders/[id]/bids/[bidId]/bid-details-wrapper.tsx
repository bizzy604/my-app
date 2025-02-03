'use client'

import { BidDetailsClient } from './bid-details-client'

interface BidDetailsWrapperProps {
  params: { id: string, bidId: string }
  bid: any
  evaluationScores: any
  documents: any[]
}

export function BidDetailsWrapper(props: BidDetailsWrapperProps) {
  return <BidDetailsClient {...props} />
}
