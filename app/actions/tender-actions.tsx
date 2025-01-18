'use server'

import { revalidatePath } from 'next/cache'

// This would typically interact with a database
let tenders = [
  {
    id: "1",
    title: "Provision of Short-Term Insurance Brokerage Services",
    sector: "Insurance Services",
    location: "Northern Cape",
    issuer: "Khai/Garib Local Municipality",
    description: "Management of Short Term Insurance Portfolio",
    closingDate: "2023-08-12T12:00:00Z",
    status: "Awarded",
    awardedTo: "",
    amount: 0,
    awardDate: "",
  },
  // ... other initial tenders
]

export async function getTenders() {
  return tenders
}

export async function getTenderById(id: string) {
  return tenders.find(tender => tender.id === id)
}

export async function createTender(tenderData: Omit<typeof tenders[0], 'id'>) {
  const newTender = {
    ...tenderData,
    id: (tenders.length + 1).toString(),
  }
  tenders.push(newTender)
  revalidatePath('/procurement-officer/tenders')
  return newTender
}

export async function updateTender(id: string, tenderData: Partial<typeof tenders[0]>) {
  const index = tenders.findIndex(tender => tender.id === id)
  if (index !== -1) {
    tenders[index] = { ...tenders[index], ...tenderData }
    revalidatePath('/procurement-officer/tenders')
    return tenders[index]
  }
  return null
}

export async function deleteTender(id: string) {
  const initialLength = tenders.length
  tenders = tenders.filter(tender => tender.id !== id)
  revalidatePath('/procurement-officer/tenders')
  return tenders.length !== initialLength
}