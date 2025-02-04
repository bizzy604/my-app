import { getBidById } from "@/app/actions/tender-actions"
import { notFound, redirect } from 'next/navigation'
import { BidDetailsWrapper } from './bid-details-wrapper'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Page({ params }: { params: { id: string, bidId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const bid = await getBidById(params.bidId)
  
  if (!bid) {
    notFound()
  }

  const evaluationScores = bid.evaluationLogs?.[0] ?? null
  const documents = bid.documents ?? []

  return (
    <BidDetailsWrapper 
      params={params} 
      bid={bid} 
      evaluationScores={evaluationScores} 
      documents={documents} 
    />
  )
}