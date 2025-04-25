import { NextRequest, NextResponse } from 'next/server'
import { getTenderBids } from '@/app/actions/tender-actions'
import { createSecureHandler } from '@/lib/api-middleware'
import { ApiToken } from '@/lib/api-auth'

export const GET = createSecureHandler(async (
  req: NextRequest,
  token: ApiToken,
  context
) => {
  try {
    const { params } = context
    const bids = await getTenderBids(params.id)
    return NextResponse.json(bids)
  } catch (error) {
    console.error('Error fetching tender bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tender bids' },
      { status: 500 }
    )
  }
})
