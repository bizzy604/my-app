'use client'

import { BidDetailsClient } from './bid-details-client'
import { BidAnalysisProgress } from '@/components/BidAnalysisProgress'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface BidDetailsWrapperProps {
  params: { id: string, bidId: string }
  bid: any
  evaluationScores: any
  documents: any[]
}

export function BidDetailsWrapper({ bid, params, evaluationScores, documents }: BidDetailsWrapperProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const startAnalysis = async () => {
    try {
      // If user doesn't have AI access, show error and return
      if (!canUseAI) {
        setError('You need an AI subscription tier to use this feature. Please upgrade your plan.')
        toast.error('AI analysis requires Innobid AI subscription. Please upgrade your plan.')
        return
      }
      
      setIsAnalyzing(true)
      setError(null)

      console.log('Starting analysis for bid:', bid.id)

      const response = await fetch('/api/crewai/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: bid.id,
          tenderId: bid.tenderId
        })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start analysis')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      toast.success('Analysis started successfully')
    } catch (error) {
      console.error('Error starting analysis:', error)
      setError(error instanceof Error ? error.message : 'Failed to start analysis')
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalysisComplete = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <BidDetailsClient
        bid={bid}
        params={params}
        evaluationScores={evaluationScores}
        documents={documents}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          {!canUseAI && (
            <div className="mt-2">
              <a href="/pricing" className="underline font-medium">
                Upgrade to Innobid AI
              </a>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="mt-4">
          <BidAnalysisProgress 
            bidId={bid.id} 
            onComplete={handleAnalysisComplete}
          />
        </div>
      )}
      
      <button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className={`px-4 py-2 rounded-md ${
          isAnalyzing
            ? 'bg-gray-400 cursor-not-allowed'
            : canUseAI 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
        } text-white font-medium`}
      >
        {isAnalyzing ? 'Analysis in Progress...' : canUseAI ? 'Start AI Analysis' : 'AI Analysis (Requires Subscription)'}
      </button>
      
      {!canUseAI && !error && (
        <div className="text-sm text-gray-600 mt-2">
          AI analysis requires an Innobid AI subscription. 
          <a href="/pricing" className="ml-1 underline text-blue-600">
            Upgrade your plan
          </a>
        </div>
      )}
    </div>
  )
}
