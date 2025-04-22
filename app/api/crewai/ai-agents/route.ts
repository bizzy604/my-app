import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { checkSubscriptionAccess } from '@/lib/subscription';

const { CREWAI_URL, CREWAI_BEARER_TOKEN } = process.env;

async function postBidToCrewAI(bidData: any): Promise<any> {
    // Format request according to CrewAI Enterprise API documentation
    const requestBody = {
        inputs: {
            bidData: bidData
        }
    };

    try {
        console.log('Sending to CrewAI:', JSON.stringify(requestBody));
    } catch (error) {
        console.log('Error stringifying request body', error);
    }

    const response = await fetch(`${CREWAI_URL}/kickoff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CREWAI_BEARER_TOKEN}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('CrewAI API error response:', errorText);
        throw new Error(`Error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('CrewAI API response:', result);
    return result;
}

// Add the POST route handler
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerAuthSession()
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user has AI subscription
        const hasAIAccess = await checkSubscriptionAccess('ai')
        
        if (!hasAIAccess) {
            return NextResponse.json(
                { 
                    error: 'AI analysis requires an active Innobid AI subscription',
                    upgradeUrl: '/pricing'
                },
                { status: 403 }
            )
        }

        // Parse the request body
        const bidData = await req.json()

        // Validate the request body
        if (!bidData || !bidData.id) {
            return NextResponse.json(
                { error: 'Invalid request: Missing bid data' },
                { status: 400 }
            )
        }

        // Transform the bid data to match the expected format for CrewAI
        // Map database fields to the inputs expected by the CrewAI model
        const transformedBidData = {
            id: bidData.id,
            amount: bidData.amount,
            completion_time: bidData.completionTime,
            technical_proposal: bidData.technicalDetails,
            vendor_experience: bidData.vendorExperience,
            documents: (bidData.documents || []).map((doc: { fileName: any; name: any; url: any; }) => ({
                name: doc.fileName || doc.name || 'Document',
                url: doc.url
            })),
            bidder: {
                company: bidData.bidder?.company
            },
            tender: {
                budget: bidData.tender?.budget,
                requirements: bidData.tender?.requirements || bidData.tender?.description || ''
            }
        };

        // Log what we're sending for troubleshooting
        console.log('Transformed bid data:', JSON.stringify(transformedBidData, null, 2));
        
        // Send the transformed bid data to CrewAI and get back a task_id
        const result = await postBidToCrewAI(transformedBidData)
        
        // Return the kickoff_id to the client for status polling
        // Make sure we're using the same field name that the frontend expects
        console.log('Returning kickoff_id to client:', result.kickoff_id || result.task_id || result.id || result.jobId);
        return NextResponse.json({ 
            kickoff_id: result.kickoff_id || result.task_id || result.id || result.jobId 
        })
    } catch (error) {
        console.error('CrewAI API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process bid' },
            { status: 500 }
        )
    }
}

// GET handler for checking job status
export async function GET(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerAuthSession()
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user has AI subscription
        const hasAIAccess = await checkSubscriptionAccess('ai')
        
        if (!hasAIAccess) {
            return NextResponse.json(
                { 
                    error: 'AI analysis requires an active Innobid AI subscription',
                    upgradeUrl: '/pricing'
                },
                { status: 403 }
            )
        }

        // Get the kickoff_id from the query parameters
        const url = new URL(req.url)
        const kickoffId = url.searchParams.get('kickoff_id')

        if (!kickoffId) {
            return NextResponse.json(
                { error: 'Missing kickoff_id parameter' },
                { status: 400 }
            )
        }

        console.log('Checking status for kickoff_id:', kickoffId)

        // Fetch the job status from CrewAI
        console.log(`Fetching status from: ${CREWAI_URL}/status/${kickoffId}`)
        const response = await fetch(`${CREWAI_URL}/status/${kickoffId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CREWAI_BEARER_TOKEN}`
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error fetching job status:', errorText)
            throw new Error(`Error fetching job status: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('CrewAI status response:', JSON.stringify(data, null, 2))
        
        // Structure the response based on the CrewAI API response format
        // CrewAI Enterprise returns 'state': 'SUCCESS' with result as a JSON string
        if (data.state === 'SUCCESS' || data.status === 'completed') {
            console.log('CrewAI job completed, processing result...');
            
            // Try to extract the structured data in the expected format
            let structuredResult;
            
            // The CrewAI response has the result as a JSON string in the 'result' field
            if (data.result && typeof data.result === 'string') {
                try {
                    // Parse the JSON string into an object
                    structuredResult = JSON.parse(data.result);
                    console.log('Successfully parsed result JSON string');
                } catch (e) {
                    console.error('Failed to parse result JSON string:', e);
                    structuredResult = { error: 'Failed to parse result' };
                }
            }
            // If result is already an object
            else if (data.result && typeof data.result === 'object') {
                structuredResult = data.result;
            }
            // Check for output field if result isn't available
            else if (data.output) {
                structuredResult = data.output;
            }
            // Fallback to the full data
            else {
                structuredResult = data;
            }
            
            // Create a compatible result structure that matches what the frontend expects
            const result = {
                document_analyst: structuredResult.document_analyst || {},
                initial_screening: structuredResult.initial_screening || {},
                compliance: structuredResult.compliance || {},
                risk_assessment: structuredResult.risk_assessment || {},
                award_recommendation: structuredResult.award_recommendation || {},
                
                // Also include debugging data
                _raw_source: typeof data.result === 'string' ? data.result.substring(0, 200) + '...' : '',
                _api_response: { state: data.state, status: data.status }
            };
            
            // Return the result in the format expected by the frontend
            return NextResponse.json({
                status: 'completed',
                result: result,
                progress: 100
            })
        } else if (data.status === 'failed') {
            // Handle failed jobs
            return NextResponse.json({
                status: 'failed',
                error: data.error || 'Job processing failed',
                progress: data.progress || 0
            })
        } else {
            // Still in progress
            return NextResponse.json({
                status: data.status || 'running',
                result: null,
                progress: data.progress || 0
            })
        }
    } catch (error) {
        console.error('Error checking job status:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to check job status' },
            { status: 500 }
        )
    }
}

// Set dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'
