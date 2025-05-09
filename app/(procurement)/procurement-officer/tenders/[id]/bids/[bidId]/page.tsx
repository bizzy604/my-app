import { getBidById } from "@/app/actions/tender-actions"
import { notFound, redirect } from 'next/navigation'
import { BidDetailsWrapper } from './bid-details-wrapper'
import { getServerAuthSession } from "@/lib/auth"

export default async function Page({ params }: { params: { id: string, bidId: string } }) {
  const session = await getServerAuthSession()
  
  if (!session) {
    redirect('/login')
  }

  // Ensure params is fully resolved before accessing properties
  const resolvedParams = await Promise.resolve(params)
  const bid = await getBidById(resolvedParams.bidId)
  
  if (!bid) {
    notFound()
  }

  const evaluationScores = bid.evaluationLogs?.[0] ?? null
  const documents = bid.documents ?? []

  return (
    <BidDetailsWrapper 
      params={resolvedParams} 
      bid={bid} 
      evaluationScores={evaluationScores} 
      documents={documents} 
    />
  )
}