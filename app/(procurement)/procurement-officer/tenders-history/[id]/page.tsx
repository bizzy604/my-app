import { getTenderById, getTenderHistory, getTenderBids } from "@/app/actions/tender-actions"
import TenderHistoryDetailClient from './client'

// This is a simple Next.js page component with dynamic route parameters
export default async function Page(props: any) {
  // Extract the ID from the route parameters
  const id = props.params.id
  
  // Fetch the data we need
  const tender = await getTenderById(id)
  const history = await getTenderHistory(id)
  const bids = await getTenderBids(id)
  
  // Render the client component with the data
  return <TenderHistoryDetailClient tender={tender} history={history} bids={bids} />
}