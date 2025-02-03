import { getTenderById, getShortlistedBids } from "@/app/actions/tender-actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TenderDetailsContent } from "@/components/tender-details-content"
import { notFound } from 'next/navigation'

export default async function TenderDetailsPage({ params }: { params: { id: string } }) {
  const tender = await getTenderById(params.id)
  const shortlistedBids = await getShortlistedBids(params.id)

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