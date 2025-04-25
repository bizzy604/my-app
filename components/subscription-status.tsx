'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreditCard, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';

type SubscriptionStatusProps = {
  tier?: string | null;
  status?: string | null;
  className?: string;
  showManageButton?: boolean;
};

export default function SubscriptionStatus({
  tier,
  status,
  className = '',
  showManageButton = true
}: SubscriptionStatusProps) {
  const router = useRouter();
  
  const isActive = status === 'active';
  const tierName = tier === 'ai' ? 'Innobid AI' : tier === 'standard' ? 'Innobid Standard' : 'No subscription';
  
  // Determine colors based on subscription tier
  const getBgColor = () => {
    if (!isActive) return 'bg-gray-100';
    if (tier === 'ai') return 'bg-purple-50';
    if (tier === 'standard') return 'bg-blue-50';
    return 'bg-gray-100';
  };
  
  const getTextColor = () => {
    if (!isActive) return 'text-gray-500';
    if (tier === 'ai') return 'text-purple-700';
    if (tier === 'standard') return 'text-blue-700';
    return 'text-gray-500';
  };
  
  const getBorderColor = () => {
    if (!isActive) return 'border-gray-200';
    if (tier === 'ai') return 'border-purple-200';
    if (tier === 'standard') return 'border-blue-200';
    return 'border-gray-200';
  };
  
  const getIcon = () => {
    if (!isActive) return <AlertCircle className="h-5 w-5 text-gray-500" />;
    if (tier === 'ai') return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
    if (tier === 'standard') return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${getBgColor()} ${getBorderColor()} flex flex-col justify-between items-start gap-3 w-full max-w-full overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-grow">
          <p className={`font-medium ${getTextColor()}`}>
            {isActive ? tierName : 'No active subscription'}
          </p>
          <p className="text-sm text-gray-500">
            {isActive ? 'Your subscription is active' : 'Please subscribe to access premium features'}
          </p>
        </div>
      </div>
      
      {showManageButton && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 w-full md:w-auto"
          onClick={() => router.push('/pricing')}
        >
          {isActive ? (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </>
          ) : (
            <>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Plans
            </>
          )}
        </Button>
      )}
    </div>
  );
}
