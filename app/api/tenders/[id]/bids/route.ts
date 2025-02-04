import { NextResponse } from 'next/server'
import { getTenderBids } from '@/app/actions/tender-actions'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bids = await getTenderBids(params.id)
    return NextResponse.json(bids)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tender bids' },
      { status: 500 }
    )
  }
}
