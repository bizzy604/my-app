import { getTenderById, getTenderHistory, getTenderBids } from "@/app/actions/tender-actions"
import TenderHistoryDetailClient from './client'
import { TenderHistoryDetailPageProps } from './types'

/**
 * Server Component for the Tender History Detail Page
 * 
 * This component fetches data on the server and passes it to a client component
 * for rendering. This pattern helps resolve the type inference issue with the
 * params prop in Next.js 13+.
 */
export default async function TenderHistoryDetailPage({ params }: TenderHistoryDetailPageProps) {
  // Server-side data fetching
  const tenderId = params.id;
  
  // Fetch data directly without hooks
  const tender = await getTenderById(tenderId);
  const history = await getTenderHistory(tenderId);
  const bids = await getTenderBids(tenderId);
  
  // Render the client component with the fetched data
  return <TenderHistoryDetailClient tender={tender} history={history} bids={bids} />;
}