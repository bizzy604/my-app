'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowUpRight } from 'lucide-react';
import { INNOBID_STANDARD_PRICE_ID, INNOBID_AI_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';

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

  const handleSubscribe = async (priceId: string, plan: 'standard' | 'ai') => {
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
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Standard Plan */}
      <Card className={`${isStandard && isActive ? 'border-blue-500 border-2' : ''}`}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Innobid Standard</span>
            {isStandard && isActive && (
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Current Plan</span>
            )}
          </CardTitle>
          <CardDescription>
            <span className="block mt-2">
              <span className="text-3xl font-bold">$99</span>
              <span className="text-sm text-gray-500">/month</span>
            </span>
            <span className="mt-2 block">Essential procurement features for your business</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span>Automated Procurement</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span>Vendor Management</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span>Bids Analysis</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span>Secure Bidding</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span>Tendering Insights</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
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
      <Card className={`${isAI && isActive ? 'border-purple-500 border-2' : ''} bg-gradient-to-br from-slate-50 to-slate-100`}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Innobid AI</span>
            {isAI && isActive && (
              <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Current Plan</span>
            )}
          </CardTitle>
          <CardDescription>
            <span className="block mt-2">
              <span className="text-3xl font-bold">$199</span>
              <span className="text-sm text-gray-500">/month</span>
            </span>
            <span className="mt-2">Advanced AI-powered procurement solutions</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start font-semibold">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>All Standard Plan Features</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>AI Bids Analysis</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>Advanced Insights & Recommendations</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>Intelligent Vendor Matching</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>Procurement Risk Assessment</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
              <span>Priority Support</span>
            </li>
          </ul>
          
          {isActive && isStandard && (
            <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
              <p className="text-sm text-purple-700 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>Upgrade now and only pay the difference ($100/month)</span>
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!isActive ? (
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe(INNOBID_AI_PRICE_ID, 'ai')}
              disabled={loadingStates.ai}
            >
              {loadingStates.ai ? 'Processing...' : 'Subscribe Now'}
            </Button>
          ) : isStandard ? (
            <Button 
              className="w-full" 
              onClick={() => handleUpdateSubscription('ai')}
              disabled={loadingStates.upgrade}
            >
              {loadingStates.upgrade ? 'Processing...' : 'Upgrade to AI Plan'}
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
