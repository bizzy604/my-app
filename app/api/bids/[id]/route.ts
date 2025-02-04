import { NextResponse } from 'next/server'
import { getBidById } from '@/app/actions/tender-actions'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bid = await getBidById(params.id)
    return NextResponse.json(bid)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bid' },
      { status: 500 }
    )
  }
}
