import { NextResponse } from 'next/server'
import { getBidById } from '@/app/actions/tender-actions'
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is fully resolved before accessing properties
    const resolvedParams = await Promise.resolve(params)
    const bid = await getBidById(resolvedParams.id)
    return NextResponse.json(bid)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bid' },
      { status: 500 }
    )
  }
}
