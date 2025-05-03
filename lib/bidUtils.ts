import { BidStatus } from '@prisma/client';

export function determineStage(scores: { 
  technicalScore: number, 
  financialScore: number, 
  experienceScore: number 
}): string {
  const totalScore = (
    (scores.technicalScore * 0.4) +
    (scores.financialScore * 0.4) +
    (scores.experienceScore * 0.2)
  )
  
  if (totalScore >= 80) return 'FINAL'
  if (totalScore >= 70) return 'FINANCIAL'
  if (totalScore >= 60) return 'TECHNICAL'
  return 'INITIAL'
}

export function determineBidStatus(stage: string): BidStatus {
  switch (stage) {
    case 'FINAL':
      return BidStatus.FINAL_EVALUATION
    case 'FINANCIAL':
      return BidStatus.SHORTLISTED
    case 'TECHNICAL':
      return BidStatus.TECHNICAL_EVALUATION
    default:
      return BidStatus.UNDER_REVIEW
  }
}
