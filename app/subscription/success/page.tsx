import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { CheckCircle } from 'lucide-react';

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/subscription/success');
  }
  
  const user = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    : null;

  // Safely access subscription information
  const subscriptionTier = user?.subscriptionTier || 'Standard';
  const planName = subscriptionTier === 'ai' ? 'Innobid AI' : 'Innobid Standard';
  
  return (
    <div className="container max-w-lg mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Subscription Successful!</h1>
      
      <p className="text-gray-600 mb-8">
        Thank you for subscribing to {planName}. Your subscription is now active, and you can access all the features included in your plan.
      </p>
      
      {subscriptionTier === 'ai' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-medium text-purple-800 mb-2">AI Features Unlocked</h2>
          <p className="text-purple-700">
            You now have access to our advanced AI bid analysis tools. Use them to gain deeper insights into your procurement process.
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/procurement-officer">
          <Button>Go to Dashboard</Button>
        </Link>
        
        <Link href="/procurement-officer/tenders">
          <Button variant="outline">View Tenders</Button>
        </Link>
      </div>
    </div>
  );
}
