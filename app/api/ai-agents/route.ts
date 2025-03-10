import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { BidStatus } from '@prisma/client'

// This function will call our Python CrewAI script
async function runProcurementAgents(bidData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a temporary JSON file with the bid data
    const tempDataPath = path.join(process.cwd(), 'temp', `bid_${bidData.id}.json`)
    const tempOutputPath = path.join(process.cwd(), 'temp', `output_${bidData.id}.json`)
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'))
    }
    
    // Write bid data to temp file
    fs.writeFileSync(tempDataPath, JSON.stringify(bidData))
    
    // Spawn Python process
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), 'scripts', 'procurement-crew-agents.py'),
      tempDataPath,
      tempOutputPath
    ])
    
    let outputData = ''
    let errorData = ''
    
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`)
        console.error(`Error: ${errorData}`)
        reject(new Error(`AI agent process failed: ${errorData}`))
        return
      }
      
      try {
        // Read the output file
        if (fs.existsSync(tempOutputPath)) {
          const result = fs.readFileSync(tempOutputPath, 'utf8')
          
          // Clean up temp files
          fs.unlinkSync(tempDataPath)
          fs.unlinkSync(tempOutputPath)
          
          resolve(result)
        } else {
          reject(new Error('AI agent process did not produce output file'))
        }
      } catch (error) {
        reject(error)
      }
    })
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // No longer checking if user is a procurement officer
    // Any authenticated user can use this endpoint
    
    const { bidId, tenderId } = await req.json()
    
    if (!bidId || !tenderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Fetch the bid with all necessary data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        bidder: true,
        tender: true,
        documents: true,
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      )
    }

    // Fetch tender requirements separately if needed
    const tenderWithRequirements = await prisma.tender.findUnique({
      where: { id: bid.tenderId },
      select: { requirements: true }
    })
    
    // Prepare bid data for AI analysis
    const bidData = {
      id: bid.id,
      amount: bid.amount,
      completion_time: bid.completionTime,
      technical_proposal: bid.technicalProposal,
      vendor_experience: bid.vendorExperience,
      submission_date: bid.submissionDate,
      status: bid.status,
      documents: bid.documents ? bid.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type
      })) : [],
      bidder: {
        id: bid.bidder.id,
        name: bid.bidder.name,
        company: bid.bidder.company || "",
        experience: bid.bidder.experience || ""
      },
      tender: {
        id: bid.tender.id,
        title: bid.tender.title,
        description: bid.tender.description,
        budget: bid.tender.budget,
        requirements: tenderWithRequirements?.requirements || []
      },
      current_evaluation: bid.evaluations && bid.evaluations[0] ? {
        technical_score: bid.evaluations[0].technicalScore,
        financial_score: bid.evaluations[0].financialScore,
        experience_score: bid.evaluations[0].experienceScore,
        total_score: bid.evaluations[0].totalScore,
        comments: bid.evaluations[0].comments
      } : null
    }
    
    // Run AI analysis
    const aiResult = await runProcurementAgents(bidData)
    
    // Parse the AI result
    const aiAnalysis = JSON.parse(aiResult)
    
    // Store the AI analysis in the database
    const analysis = await prisma.AIAnalysis.create({
      data: {
        bidId: bid.id,
        tenderId: bid.tenderId,
        initialScreeningScore: aiAnalysis.initial_screening?.score || 0,
        complianceScore: aiAnalysis.compliance?.score || 0,
        riskAssessmentScore: aiAnalysis.risk_assessment?.score || 0,
        comparativeScore: aiAnalysis.comparative_analysis?.score || 0,
        recommendationScore: aiAnalysis.award_recommendation?.score || 0,
        initialScreeningReport: aiAnalysis.initial_screening?.report || '',
        complianceReport: aiAnalysis.compliance?.report || '',
        riskAssessmentReport: aiAnalysis.risk_assessment?.report || '',
        comparativeReport: aiAnalysis.comparative_analysis?.report || '',
        recommendationReport: aiAnalysis.award_recommendation?.report || '',
        createdBy: Number(session.user.id)
      }
    })
    
    // Update bid status based on AI recommendation if needed
    if (aiAnalysis.award_recommendation?.recommended && bid.status === BidStatus.UNDER_REVIEW) {
      await prisma.bid.update({
        where: { id: bid.id },
        data: { status: BidStatus.SHORTLISTED }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      analysis: {
        id: analysis.id,
        initialScreeningScore: analysis.initialScreeningScore,
        complianceScore: analysis.complianceScore,
        riskAssessmentScore: analysis.riskAssessmentScore,
        comparativeScore: analysis.comparativeScore,
        recommendationScore: analysis.recommendationScore,
        initialScreeningReport: analysis.initialScreeningReport,
        complianceReport: analysis.complianceReport,
        riskAssessmentReport: analysis.riskAssessmentReport,
        comparativeReport: analysis.comparativeReport,
        recommendationReport: analysis.recommendationReport,
        createdAt: analysis.createdAt
      }
    })
    
  } catch (error) {
    console.error('AI agent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 