'use client'

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: string
  plan: {
    id: string
    name: string
    price: number
  }
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionManagePage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [processingRequest, setProcessingRequest] = useState(false)

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoading(true)
        const response = await axios.get('/api/user/subscription')
        setSubscription(response.data.subscription)
      } catch (error) {
        console.error('Failed to load subscription:', error)
        toast.error('Failed to load subscription details')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const handleManagePayment = async () => {
    try {
      setProcessingRequest(true)
      const response = await axios.post('/api/customer-portal')
      
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error) {
      console.error('Failed to access customer portal:', error)
      toast.error('Could not access billing portal')
    } finally {
      setProcessingRequest(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setProcessingRequest(true)
      await axios.post('/api/subscription/cancel', { subscriptionId: subscription?.id })
      
      toast.success('Your subscription has been canceled')
      setCancelDialogOpen(false)
      
      // Refresh subscription data
      const response = await axios.get('/api/user/subscription')
      setSubscription(response.data.subscription)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast.error('Could not cancel subscription')
    } finally {
      setProcessingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Subscribe to Innobid to unlock premium features and enhanced procurement tools.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/subscription')}>View Plans</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{subscription.plan.name}</CardTitle>
              <CardDescription>
                ${subscription.plan.price / 100}/month
              </CardDescription>
            </div>
            <Badge 
              variant={
                subscription.status === 'active' 
                  ? 'default' 
                  : subscription.status === 'past_due' 
                    ? 'destructive' 
                    : 'outline'
              }
            >
              {subscription.status === 'active' && subscription.cancelAtPeriodEnd 
                ? 'Canceling' 
                : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Current Period</p>
            <p className="text-sm text-muted-foreground">
              {subscription.currentPeriodEnd 
                ? `Your subscription will ${subscription.cancelAtPeriodEnd ? 'end' : 'renew'} on ${format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}`
                : 'Period information unavailable'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button 
            onClick={handleManagePayment} 
            disabled={processingRequest}
          >
            {processingRequest ? 'Processing...' : 'Manage Payment Method'}
          </Button>
          
          {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={processingRequest}>
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period on {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={processingRequest}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={processingRequest}
                  >
                    {processingRequest ? 'Processing...' : 'Yes, Cancel Subscription'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you have any questions about your subscription or billing, please contact our support team.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/contact')}>
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
