import { BidStatus } from '@prisma/client';
import { determineBidStatus, determineStage } from '@/app/api/bids/evaluate/route';

// This is an integration test that covers the critical bid evaluation logic
// including the fix mentioned in your memories regarding shortlisted candidates

describe('Bid Evaluation Integration', () => {
  describe('determineStage and determineBidStatus integration', () => {
    it('correctly maps high scores (≥80) to FINAL stage and FINAL_EVALUATION status', () => {
      const scores = { technicalScore: 85, financialScore: 90, experienceScore: 80 };
      
      const stage = determineStage(scores);
      expect(stage).toBe('FINAL');
      
      const status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.FINAL_EVALUATION);
    });

    it('correctly maps medium scores (≥70) to FINANCIAL stage and SHORTLISTED status', () => {
      const scores = { technicalScore: 75, financialScore: 72, experienceScore: 70 };
      
      const stage = determineStage(scores);
      expect(stage).toBe('FINANCIAL');
      
      const status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.SHORTLISTED);
    });

    it('correctly maps lower scores (≥60) to TECHNICAL stage and TECHNICAL_EVALUATION status', () => {
      const scores = { technicalScore: 65, financialScore: 60, experienceScore: 60 };
      
      const stage = determineStage(scores);
      expect(stage).toBe('TECHNICAL');
      
      const status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.TECHNICAL_EVALUATION);
    });

    it('correctly maps insufficient scores (<60) to INITIAL stage and UNDER_REVIEW status', () => {
      const scores = { technicalScore: 55, financialScore: 50, experienceScore: 50 };
      
      const stage = determineStage(scores);
      expect(stage).toBe('INITIAL');
      
      const status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.UNDER_REVIEW);
    });
    
    // Test the fix for the shortlisted candidates issue
    it('ensures bids with scores 70-79 are properly set as SHORTLISTED', () => {
      // These are scores that would calculate to a total between 70-79
      const scoresForShortlisting = [
        { technicalScore: 70, financialScore: 70, experienceScore: 70 }, // Exact 70
        { technicalScore: 75, financialScore: 75, experienceScore: 75 }, // Mid-range 75
        { technicalScore: 79, financialScore: 79, experienceScore: 79 }, // Upper bound 79
        // Edge case with weighted score of 72
        { technicalScore: 80, financialScore: 70, experienceScore: 60 }
      ];
      
      scoresForShortlisting.forEach(scores => {
        const stage = determineStage(scores);
        const status = determineBidStatus(stage);
        
        // This is the critical test for the fix mentioned in memories
        expect(status).toBe(BidStatus.SHORTLISTED);
      });
    });
  });
  
  describe('Edge cases in bid evaluation', () => {
    it('handles extreme scores correctly', () => {
      // Perfect scores
      const perfectScores = { technicalScore: 100, financialScore: 100, experienceScore: 100 };
      let stage = determineStage(perfectScores);
      let status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.FINAL_EVALUATION);
      
      // Minimum scores
      const minimumScores = { technicalScore: 0, financialScore: 0, experienceScore: 0 };
      stage = determineStage(minimumScores);
      status = determineBidStatus(stage);
      expect(status).toBe(BidStatus.UNDER_REVIEW);
    });
    
    it('handles uneven scores that cross thresholds', () => {
      // High technical, low others
      const unevenScores1 = { technicalScore: 100, financialScore: 50, experienceScore: 50 };
      // Should evaluate to: (100 * 0.4) + (50 * 0.4) + (50 * 0.2) = 40 + 20 + 10 = 70
      const stage1 = determineStage(unevenScores1);
      const status1 = determineBidStatus(stage1);
      expect(stage1).toBe('FINANCIAL');
      expect(status1).toBe(BidStatus.SHORTLISTED);
      
      // Low technical, high others
      const unevenScores2 = { technicalScore: 50, financialScore: 100, experienceScore: 100 };
      // Should evaluate to: (50 * 0.4) + (100 * 0.4) + (100 * 0.2) = 20 + 40 + 20 = 80
      const stage2 = determineStage(unevenScores2);
      const status2 = determineBidStatus(stage2);
      expect(stage2).toBe('FINAL');
      expect(status2).toBe(BidStatus.FINAL_EVALUATION);
    });
  });
});
