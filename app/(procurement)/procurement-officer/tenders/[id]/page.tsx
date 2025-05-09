import { getTenderById, getShortlistedBids } from "@/app/actions/tender-actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TenderDetailsContent } from "@/components/tender-details-content"
import { notFound } from 'next/navigation'

export default async function TenderDetailsPage({ params }: { params: { id: string } }) {
  // Ensure params is fully resolved before accessing properties
  const resolvedParams = await Promise.resolve(params)
  const tender = await getTenderById(resolvedParams.id)
  const shortlistedBids = await getShortlistedBids(resolvedParams.id)

  if (!tender) {
    notFound()
  }

  return (
    <DashboardLayout>
      <TenderDetailsContent 
        tender={tender}
        shortlistedBids={shortlistedBids}
      />
    </DashboardLayout>
  )
} 