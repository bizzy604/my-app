import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PricingPlans from '@/components/pricing-plans';
import { redirect } from 'next/navigation';

export default async function PricingPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/pricing');
  }
  
  const user = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          subscriptionEndDate: true
        }
      })
    : null;
    
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Choose Your Innobid Plan</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        Select the best subscription plan for your procurement needs. Upgrade anytime to access more features.
      </p>
      
      <PricingPlans currentSubscription={user?.subscriptionTier} subscriptionStatus={user?.subscriptionStatus} />
    </div>
  );
}
