'use client'

import { BidDetailsClient } from './bid-details-client'
import { useState, useEffect } from 'react'

interface BidDetailsWrapperProps {
  params: { id: string, bidId: string }
  bid: any
  evaluationScores: any
  documents: any[]
}

export function BidDetailsWrapper({ bid, params, evaluationScores, documents }: BidDetailsWrapperProps) {
  const [canUseAI, setCanUseAI] = useState(false)

  // Check if user has access to AI features
  useEffect(() => {
    const checkAIAccess = async () => {
      try {
        const response = await fetch('/api/user/subscription-access?tier=ai')
        if (response.ok) {
          const data = await response.json()
          setCanUseAI(data.hasAccess)
        } else {
          setCanUseAI(false)
        }
      } catch (error) {
        console.error('Error checking AI access:', error)
        setCanUseAI(false)
      }
    }
    
    checkAIAccess()
  }, [])


  return (
    <div className="space-y-4">
      <BidDetailsClient
        bid={bid}
        params={params}
        evaluationScores={evaluationScores}
        documents={documents}
      /> 
    </div>
  )
}
