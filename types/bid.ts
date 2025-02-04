import { BidStatus } from '@prisma/client'

export interface BidWithDetails {
  id: string
  tenderId: string
  amount: number
  status: BidStatus
  evaluationStage?: string
  technicalScore?: number
  financialScore?: number
  experienceScore?: number
  evaluationComments?: string
  bidder: {
    id: number
    name: string
    company: string | null
  }
  documents: Array<{
    id: string
    fileName: string
    fileType: string
    url: string
  }>
  evaluationLogs?: Array<{
    id: string
    stage: string
    score: number
    comments?: string
    technicalScore?: number
    financialScore?: number
    experienceScore?: number
    totalScore?: number
    evaluatedBy: number
  }>
}
