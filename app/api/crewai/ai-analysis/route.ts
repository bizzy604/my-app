import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSecureHandler } from '@/lib/api-middleware'
import { ApiToken } from '@/lib/api-auth'
import { checkSubscriptionTier } from '@/lib/api-middleware'

export const GET = createSecureHandler(async (req: NextRequest, token: ApiToken) => {
  try {
    // Check if user has AI subscription tier
    const hasAIAccess = await checkSubscriptionTier(token, 'ai')
    
    if (!hasAIAccess) {
      return NextResponse.json(
        { 
          error: 'AI analysis requires an active Innobid AI subscription',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const url = new URL(req.url)
    const bidId = url.searchParams.get('bidId')
    const tenderId = url.searchParams.get('tenderId')
    
    if (!bidId && !tenderId) {
      return NextResponse.json(
        { error: 'Missing required parameters. Please provide bidId or tenderId.' },
        { status: 400 }
      )
    }
    
    // Construct query based on provided parameters
    const whereClause: any = {}
    
    if (bidId) {
      whereClause.bidId = bidId
    }
    
    if (tenderId) {
      whereClause.tenderId = tenderId
    }
    
    // Fetch analyses from the database
    const analyses = await prisma.aIAnalysis.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: bidId ? 1 : 10 // If bidId is provided, get only the most recent one
    })
    
    if (analyses.length === 0) {
      return NextResponse.json({ analysis: null })
    }
    
    // Return the most recent analysis if bidId was provided
    if (bidId) {
      return NextResponse.json({ analysis: analyses[0] })
    }
    
    // Return all analyses if only tenderId was provided
    return NextResponse.json({ analyses })
    
  } catch (error) {
    console.error('Error fetching AI analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
})
