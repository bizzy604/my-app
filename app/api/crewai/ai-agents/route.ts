import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const BASE_URL = "https://innobid-ai-agents-ef9cd140-5c78-4ea7-bdce-6-a82d6ef7.crewai.com";
const BEARER_TOKEN = "2e92e13589ac";

const execPromise = util.promisify(exec);

async function postBidToCrewAI(bidData: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/kickoff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify({
            inputs: {
                id: bidData.id,
                amount: bidData.amount,
                completion_time: bidData.completion_time,
                technical_proposal: bidData.technical_proposal,
                vendor_experience: bidData.vendor_experience,
                documents: bidData.documents.map((doc: { name: any; url: any; }) => ({
                    name: doc.name,
                    url: doc.url
                })),
                bidder: {
                    company: bidData.bidder.company
                },
                tender: {
                    budget: bidData.tender.budget,
                    requirements: bidData.tender.requirements
                }
            },
            meta: "Additional metadata if needed",
        })
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const { bidId, tenderId } = await req.json();
        
        if (!bidId || !tenderId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }
        
        // Fetch the bid data first
        const bid = await prisma.bid.findUnique({
            where: { id: bidId },
            include: {
                bidder: true,
                tender: true,
                documents: true
            }
        });

        if (!bid) {
            return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
        }

        // Prepare bid data
        const bidData = {
            id: bid.id,
            amount: bid.amount,
            completion_time: bid.completionTime,
            technical_proposal: bid.technicalProposal,
            vendor_experience: bid.vendorExperience,
            documents: bid.documents.map(doc => ({
                name: doc.fileName,
                url: doc.url
            })),
            bidder: {
                company: bid.bidder.company || bid.bidder.name
            },
            tender: {
                budget: bid.tender.budget,
                requirements: bid.tender.requirements
            }
        };

        // Define the path to the directory where crew.py and pyproject.toml are located
        const crewDirectory = path.join(process.cwd(), 'scripts/innobid_ai_agent');

        // Run the CrewAI agent
        const { stdout, stderr } = await execPromise('crewai run', { cwd: crewDirectory });

        if (stderr) {
            throw new Error(`Error running agent: ${stderr}`);
        }

        // Parse the output (assuming it's in JSON format)
        const result = JSON.parse(stdout);

        // Store the results in the database
        const aiAnalysis = await prisma.aIAnalysis.create({
            data: {
                bidId: bid.id,
                tenderId: tenderId,
                initialScreeningScore: result.initial_screening.score,
                complianceScore: result.compliance.score,
                riskAssessmentScore: result.risk_assessment.score,
                comparativeScore: result.comparative_analysis.score,
                recommendationScore: result.award_recommendation.score,
                initialScreeningReport: result.initial_screening.report,
                complianceReport: result.compliance.report,
                riskAssessmentReport: result.risk_assessment.report,
                comparativeReport: result.comparative_analysis.report,
                recommendationReport: result.award_recommendation.report,
                createdBy: session.user.id // Assuming you have the user ID in the session
            }
        });

        return NextResponse.json({ success: true, result: aiAnalysis });
    } catch (error) {
        console.error('Error running AI analysis:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function checkTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/status/${taskId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
}