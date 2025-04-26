/**
 * Tests for bid evaluation functionality
 * 
 * These tests specifically focus on the critical fix for the issue where
 * bids scoring between 70-79 weren't properly appearing in the shortlisted
 * candidates UI because they weren't being marked with SHORTLISTED status.
 */

// Import from Prisma
import { BidStatus } from '@prisma/client';

// Import the functions we want to test
import { determineStage, determineBidStatus } from '@/app/api/bids/evaluate/route';

describe('Bid Evaluation System', () => {
  describe('determineStage function', () => {
    it('calculates weighted scores correctly', () => {
      // Test case: 80 * 0.4 + 80 * 0.4 + 80 * 0.2 = 32 + 32 + 16 = 80
      expect(determineStage({ 
        technicalScore: 80, 
        financialScore: 80, 
        experienceScore: 80 
      })).toBe('FINAL');
      
      // Test case: 70 * 0.4 + 70 * 0.4 + 70 * 0.2 = 28 + 28 + 14 = 70
      expect(determineStage({ 
        technicalScore: 70, 
        financialScore: 70, 
        experienceScore: 70 
      })).toBe('FINANCIAL');
      
      // Test case: 65 * 0.4 + 55 * 0.4 + 60 * 0.2 = 26 + 22 + 12 = 60
      expect(determineStage({
        technicalScore: 65,
        financialScore: 55,
        experienceScore: 60
      })).toBe('TECHNICAL');
      
      // Test case: 55 * 0.4 + 50 * 0.4 + 50 * 0.2 = 22 + 20 + 10 = 52
      expect(determineStage({ 
        technicalScore: 55, 
        financialScore: 50, 
        experienceScore: 50 
      })).toBe('INITIAL');
    });

    it('identifies stage boundaries correctly', () => {
      // Exactly 80 (FINAL threshold)
      expect(determineStage({ 
        technicalScore: 85, 
        financialScore: 75, 
        experienceScore: 80 
      })).toBe('FINAL');
      
      // Just below 80 (should be FINANCIAL)
      expect(determineStage({ 
        technicalScore: 79, 
        financialScore: 79, 
        experienceScore: 79 
      })).toBe('FINANCIAL');
      
      // Exactly 70 (FINANCIAL threshold)
      expect(determineStage({ 
        technicalScore: 75, 
        financialScore: 65, 
        experienceScore: 70 
      })).toBe('FINANCIAL');
      
      // Just below 70 (should be TECHNICAL)
      expect(determineStage({ 
        technicalScore: 69, 
        financialScore: 69, 
        experienceScore: 69
      })).toBe('TECHNICAL');
      
      // Exactly 60 (TECHNICAL threshold)
      expect(determineStage({
        technicalScore: 60,
        financialScore: 60,
        experienceScore: 60
      })).toBe('TECHNICAL');
      
      // Just below 60 (should be INITIAL)
      expect(determineStage({ 
        technicalScore: 59, 
        financialScore: 59, 
        experienceScore: 59
      })).toBe('INITIAL');
    });
  });

  describe('determineBidStatus function', () => {
    it('maps stages to correct bid statuses', () => {
      expect(determineBidStatus('FINAL')).toBe(BidStatus.FINAL_EVALUATION);
      expect(determineBidStatus('FINANCIAL')).toBe(BidStatus.SHORTLISTED);
      expect(determineBidStatus('TECHNICAL')).toBe(BidStatus.TECHNICAL_EVALUATION);
      expect(determineBidStatus('INITIAL')).toBe(BidStatus.UNDER_REVIEW);
      expect(determineBidStatus('UNKNOWN')).toBe(BidStatus.UNDER_REVIEW);
    });
    
    /**
     * This test specifically verifies the fix for the issue where bids
     * with scores between 70-79 weren't appearing in the shortlisted candidates UI
     * because they weren't correctly mapped to the SHORTLISTED status.
     */
    it('correctly identifies FINANCIAL stage bids as SHORTLISTED', () => {
      // Bids in the 70-79 score range should be mapped to SHORTLISTED status
      
      // A bid at the lower boundary (70) should be SHORTLISTED
      const lowerBoundaryScore = { technicalScore: 70, financialScore: 70, experienceScore: 70 };
      const lowerBoundaryStage = determineStage(lowerBoundaryScore);
      expect(lowerBoundaryStage).toBe('FINANCIAL');
      expect(determineBidStatus(lowerBoundaryStage)).toBe(BidStatus.SHORTLISTED);
      
      // A bid at the upper boundary (79.99) should be SHORTLISTED
      const upperBoundaryScore = { technicalScore: 79, financialScore: 79, experienceScore: 79 };
      const upperBoundaryStage = determineStage(upperBoundaryScore);
      expect(upperBoundaryStage).toBe('FINANCIAL');
      expect(determineBidStatus(upperBoundaryStage)).toBe(BidStatus.SHORTLISTED);
      
      // A bid with uneven scores but in the FINANCIAL range should be SHORTLISTED
      const unevenScore = { technicalScore: 80, financialScore: 60, experienceScore: 70 };
      const unevenStage = determineStage(unevenScore);
      expect(unevenStage).toBe('FINANCIAL');
      expect(determineBidStatus(unevenStage)).toBe(BidStatus.SHORTLISTED);
    });
  });

  describe('stage to status integration', () => {
    it('calculates end-to-end bid status based on scores', () => {
      // Helper function to test the full flow from scores to status
      const calculateStatusFromScores = (scores: { 
        technicalScore: number, 
        financialScore: number, 
        experienceScore: number 
      }) => {
        const stage = determineStage(scores);
        return determineBidStatus(stage);
      };
      
      // Scores >= 80 should result in FINAL_EVALUATION
      expect(calculateStatusFromScores({ 
        technicalScore: 90, financialScore: 85, experienceScore: 80 
      })).toBe(BidStatus.FINAL_EVALUATION);
      
      // Scores 70-79 should result in SHORTLISTED
      expect(calculateStatusFromScores({ 
        technicalScore: 75, financialScore: 75, experienceScore: 70 
      })).toBe(BidStatus.SHORTLISTED);
      
      // Scores 60-69 should result in TECHNICAL_EVALUATION
      expect(calculateStatusFromScores({ 
        technicalScore: 65, financialScore: 60, experienceScore: 65 
      })).toBe(BidStatus.TECHNICAL_EVALUATION);
      
      // Scores < 60 should result in UNDER_REVIEW
      expect(calculateStatusFromScores({ 
        technicalScore: 55, financialScore: 50, experienceScore: 55 
      })).toBe(BidStatus.UNDER_REVIEW);
    });
  });
});
