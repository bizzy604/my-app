'use client'

import { BidDetailsClient } from './bid-details-client'
import { BidAnalysisProgress } from '@/components/BidAnalysisProgress'
import { useState } from 'react'
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

  const startAnalysis = async () => {
    try {
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
        throw new Error('Failed to start analysis')
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
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-medium`}
      >
        {isAnalyzing ? 'Analysis in Progress...' : 'Start AI Analysis'}
      </button>
    </div>
  )
}
