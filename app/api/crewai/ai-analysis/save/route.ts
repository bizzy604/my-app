import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const { bidId, tenderId, analysisData } = await req.json()
    
    if (!bidId || !tenderId || !analysisData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }
    
    console.log('Saving analysis data:', JSON.stringify(analysisData, null, 2))
    
    // Map the response from CrewAI's AggregateResults structure to our database schema
    // Make sure we're handling the exact structure from CrewAI with the five components
    const createdAnalysis = await prisma.aIAnalysis.create({
      data: {
        bidId,
        tenderId,
        // Extract scores from each analysis component
        initialScreeningScore: analysisData.initial_screening?.score || 0,
        complianceScore: analysisData.compliance?.score || 0,
        riskAssessmentScore: analysisData.risk_assessment?.score || 0,
        comparativeScore: analysisData.document_analyst?.score || 0,
        recommendationScore: analysisData.award_recommendation?.score || 0,
        // Extract reports from each analysis component
        initialScreeningReport: analysisData.initial_screening?.report || '',
        complianceReport: analysisData.compliance?.report || '',
        riskAssessmentReport: analysisData.risk_assessment?.report || '',
        comparativeReport: analysisData.document_analyst?.report || '',
        recommendationReport: analysisData.award_recommendation?.report || '',
        createdBy: session.user.id ? parseInt(session.user.id.toString(), 10) : 1,
      }
    })
    
    return NextResponse.json({ analysis: createdAnalysis })
    
  } catch (error) {
    console.error('Error saving AI analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 

// Set dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'
