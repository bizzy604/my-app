'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { INNOBID_STANDARD_PRICE_ID, INNOBID_AI_PRICE_ID } from '@/lib/stripe';

type PricingPlansProps = {
  currentSubscription?: string | null;
  subscriptionStatus?: string | null;
};

export default function PricingPlans({ currentSubscription, subscriptionStatus }: PricingPlansProps) {
  const [loadingStates, setLoadingStates] = useState({
    standard: false,
    ai: false,
    portal: false,
    upgrade: false
  });
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string | undefined, plan: 'standard' | 'ai') => {
    if (!priceId) {
      toast({
        title: 'Configuration Error',
        description: 'Subscription price ID is not configured',
        variant: 'destructive',
      });
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, [plan]: true }));
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [plan]: false }));
    }
  };

  const handleUpdateSubscription = async (targetTier: 'standard' | 'ai') => {
    setLoadingStates(prev => ({ ...prev, upgrade: true }));
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetTier }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, upgrade: false }));
    }
  };

  const handleManageSubscription = async () => {
    setLoadingStates(prev => ({ ...prev, portal: true }));
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to access customer portal');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Customer portal error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to access customer portal',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, portal: false }));
    }
  };

  const isActive = subscriptionStatus === 'active';
  const isStandard = currentSubscription === 'standard';
  const isAI = currentSubscription === 'ai';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
      {/* Standard Plan */}
      <Card className={`${isStandard && isActive ? 'border-blue-500 dark:border-blue-400 border-2' : ''}`}>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>Innobid Standard</span>
            {isStandard && isActive && (
              <span className="text-xs sm:text-sm bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">Current Plan</span>
            )}
          </CardTitle>
          <CardDescription>
            <span className="block mt-2">
              <span className="text-2xl sm:text-3xl font-bold">$99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </span>
            <span className="mt-2 block">Essential procurement features for your business</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Automated Procurement</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Vendor Management</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Bids Analysis</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Secure Bidding</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Tendering Insights</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Realtime Updates</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {!isActive ? (
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe(INNOBID_STANDARD_PRICE_ID, 'standard')}
              disabled={loadingStates.standard}
            >
              {loadingStates.standard ? 'Processing...' : 'Subscribe Now'}
            </Button>
          ) : isAI ? (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleUpdateSubscription('standard')}
              disabled={loadingStates.upgrade}
            >
              {loadingStates.upgrade ? 'Processing...' : 'Downgrade to Standard'}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loadingStates.portal}
            >
              {loadingStates.portal ? 'Processing...' : 'Manage Subscription'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* AI Plan */}
      <Card className={`${isAI && isActive ? 'border-primary border-2' : ''} bg-primary/5 dark:bg-primary/10`}>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>Innobid AI</span>
            {isAI && isActive && (
              <span className="text-xs sm:text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">Current Plan</span>
            )}
          </CardTitle>
          <CardDescription>
            <span className="block mt-2">
              <span className="text-2xl sm:text-3xl font-bold">$199</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </span>
            <span className="mt-2 block">Advanced AI features for intelligent procurement</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
              <span>Everything in Standard plan</span>
            </li>
            <li className="flex items-start">
              <ArrowUpRight className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="font-medium">AI-Powered Bid Analysis</span>
            </li>
            <li className="flex items-start">
              <ArrowUpRight className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="font-medium">Bid Anomaly Detection</span>
            </li>
            <li className="flex items-start">
              <ArrowUpRight className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="font-medium">Corruption Risk Predictions</span>
            </li>
            <li className="flex items-start">
              <ArrowUpRight className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="font-medium">Advanced Analytics Dashboard</span>
            </li>
            <li className="flex items-start">
              <ArrowUpRight className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="font-medium">AI-Assisted Decision Making</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {!isActive ? (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={() => handleSubscribe(INNOBID_AI_PRICE_ID, 'ai')}
              disabled={loadingStates.ai}
            >
              {loadingStates.ai ? 'Processing...' : 'Subscribe Now'}
            </Button>
          ) : isStandard ? (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleUpdateSubscription('ai')}
              disabled={loadingStates.upgrade}
            >
              {loadingStates.upgrade ? 'Processing...' : 'Upgrade to AI'}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loadingStates.portal}
            >
              {loadingStates.portal ? 'Processing...' : 'Manage Subscription'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
