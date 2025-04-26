import { BidStatus } from '@prisma/client';
import { determineStage, determineBidStatus } from '@/app/api/bids/evaluate/route';

// Mock Prisma client (REMOVED - Handled by manual mock in __mocks__)

describe('determineStage', () => {
  it('returns FINAL for total score >= 80', () => {
    expect(determineStage({ technicalScore: 80, financialScore: 80, experienceScore: 80 })).toBe('FINAL');
  });

  it('returns FINANCIAL for total score between 70 and 79', () => {
    expect(determineStage({ technicalScore: 75, financialScore: 70, experienceScore: 70 })).toBe('FINANCIAL');
  });

  it('returns TECHNICAL for total score between 60 and 69', () => {
    expect(determineStage({ technicalScore: 65, financialScore: 60, experienceScore: 60 })).toBe('TECHNICAL');
  });

  it('returns INITIAL for total score below 60', () => {
    expect(determineStage({ technicalScore: 50, financialScore: 50, experienceScore: 50 })).toBe('INITIAL');
  });
});

describe('determineBidStatus', () => {
  it('returns FINAL_EVALUATION for stage FINAL', () => {
    expect(determineBidStatus('FINAL')).toBe('FINAL_EVALUATION');
  });

  it('returns SHORTLISTED for stage FINANCIAL', () => {
    expect(determineBidStatus('FINANCIAL')).toBe('SHORTLISTED');
  });

  it('returns TECHNICAL_EVALUATION for stage TECHNICAL', () => {
    expect(determineBidStatus('TECHNICAL')).toBe('TECHNICAL_EVALUATION');
  });

  it('returns UNDER_REVIEW for unknown stage', () => {
    expect(determineBidStatus('UNKNOWN')).toBe('UNDER_REVIEW');
  });
});
