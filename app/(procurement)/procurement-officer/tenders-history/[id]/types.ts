import { Document } from "@prisma/client"
import { BidStatus, TenderStatus, Prisma } from '@prisma/client'

export interface TenderWithDetails {
  id: string
  title: string
  status: string
  description: string
  sector: string
  category: string
  location: string
  budget: number
  closingDate: Date
  createdAt: Date
  documents: Document[]
  bids: Array<{
    id: string
    amount: number
    status: BidStatus
    bidder: {
      name: string
      company: string | null
    }
    evaluationLogs?: Array<{
      score: number
      technicalScore: number | null
      financialScore: number | null
    }>
  }>
}

export interface BidDetailsType {
  id: string
  amount: number
  status: string
  bidder: {
    name: string
    company: string
  }
  evaluationScore?: number
  technicalScore?: number
  financialScore?: number
}

export interface SingleTenderHistory {
  id: string
  status: TenderStatus
  tenderId: string
  changedBy: number
  changeDate: Date
  comments: string | null
  previousValues: Prisma.JsonValue
  newValues: Prisma.JsonValue
  changedByUser: {
    name: string
    email: string
  }
}

export interface TenderWithHistory {
  bids: Array<{
    bidder: {
      name: string
      company: string | null
    }
    id: string
    tenderId: string
    status: BidStatus
  }>
  history: Array<{
    id: string
    status: TenderStatus
    changedByUser: {
      name: string
    }
    changeDate: Date
    comments: string | null
  }>
}

export interface TimelineEventType {
  id: string
  status: string
  date: string
  comments?: string
  changedBy: {
    name: string
  }
}

// Note: Page props are now defined inline in the page component
