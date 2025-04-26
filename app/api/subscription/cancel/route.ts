import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();

    // Authenticate the user
    const session = await getServerAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    // Get the user with their subscription data
    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id)
      }
    })

    if (!user || user.subscriptionId !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Cancel the subscription in Stripe (at period end)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    // Update the subscription status in the user record
    await prisma.user.update({
      where: {
        id: Number(session.user.id)
      },
      data: {
        subscriptionStatus: 'canceled_at_period_end'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
