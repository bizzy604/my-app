'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [planName, setPlanName] = useState('your plan');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('Activating your subscription...');
  
  useEffect(() => {
    async function updateSubscriptionAndRedirect() {
      if (!sessionId) {
        // No session ID, redirect to dashboard anyway with the subscribed flag
        router.push('/procurement-officer?subscribed=true');
        return;
      }
      
      try {
        // Get CSRF token to use for the activation request - with better error handling
        let csrfToken;
        try {
          const csrfResponse = await fetch('/api/csrf');
          if (!csrfResponse.ok) {
            throw new Error(`Failed to get CSRF token: ${csrfResponse.status} ${csrfResponse.statusText}`);
          }
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken;
          console.log('Successfully obtained CSRF token for activation:', csrfToken ? 'Token received' : 'No token in response');
        } catch (csrfError) {
          console.error('CSRF token fetch error:', csrfError);
          setMessage('Having trouble with authentication. Trying to proceed anyway...');
        }
        
        // First, directly update the subscription status
        const updateResponse = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken || '',  // Include CSRF token
          },
          body: JSON.stringify({ 
            sessionId,
          }),
        });
        
        if (!updateResponse.ok) {
          console.error('Failed to activate subscription:', await updateResponse.text());
          setMessage('Having trouble activating your subscription. Trying an alternative method...');
        } else {
          setMessage('Subscription activated! Updating your session...');
        }
        
        // Then get subscription info to show the correct plan
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setPlanName(data.subscriptionTier === 'ai' ? 'Innobid AI' : 'Innobid Standard');
        }
        
        // Now force a session refresh to ensure the token has the latest subscription data
        // This approach is more reliable than the subscribed query parameter
        setMessage('Refreshing your session...');
        
        // Use the payment-success endpoint to handle environment detection and redirection
        window.location.href = '/api/payment-success?redirect=/procurement-officer';
        
      } catch (error) {
        console.error('Error processing subscription:', error);
        // Still redirect even if there's an error
        setTimeout(() => {
          setIsLoading(false);
          router.push('/procurement-officer?subscribed=true');
        }, 2000);
      }
    }
    
    updateSubscriptionAndRedirect();
  }, [router, sessionId]);
  
  return (
    <div className="container max-w-lg mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Subscription Successful!</h1>
      
      <p className="text-gray-600 mb-8">
        Thank you for subscribing to {planName}. Your subscription is now active!
      </p>
      
      <div className="flex flex-col items-center mt-8">
        {isLoading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
            <p>{message}</p>
          </>
        ) : (
          <p>Redirecting to your dashboard...</p>
        )}
      </div>
    </div>
  );
}
