import { isFeatureAccessible } from '@/lib/subscription';

// Mock prisma and next-auth since we'll test only the client-side functions
jest.mock('@/lib/prisma', () => ({
  prisma: {}
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

describe('subscription util functions', () => {
  describe('isFeatureAccessible', () => {
    it('grants standard access to procurement officers', () => {
      const user = {
        role: 'PROCUREMENT',
        subscriptionStatus: null,
        subscriptionTier: null
      };
      
      expect(isFeatureAccessible(user, 'standard')).toBe(true);
    });

    it('requires active subscription for standard access for non-procurement users', () => {
      const inactiveUser = {
        role: 'VENDOR',
        subscriptionStatus: 'inactive',
        subscriptionTier: 'standard'
      };
      
      expect(isFeatureAccessible(inactiveUser, 'standard')).toBe(false);
      
      const activeUser = {
        role: 'VENDOR',
        subscriptionStatus: 'active',
        subscriptionTier: 'standard'
      };
      
      expect(isFeatureAccessible(activeUser, 'standard')).toBe(true);
    });

    it('requires AI subscription for AI features', () => {
      const standardUser = {
        role: 'VENDOR',
        subscriptionStatus: 'active',
        subscriptionTier: 'standard'
      };
      
      expect(isFeatureAccessible(standardUser, 'ai')).toBe(false);
      
      const aiUser = {
        role: 'VENDOR',
        subscriptionStatus: 'active',
        subscriptionTier: 'ai'
      };
      
      expect(isFeatureAccessible(aiUser, 'ai')).toBe(true);
    });

    it('denies access to procurement officers for AI features if they do not have AI subscription', () => {
      const procurementUser = {
        role: 'PROCUREMENT',
        subscriptionStatus: null,
        subscriptionTier: null
      };
      
      expect(isFeatureAccessible(procurementUser, 'ai')).toBe(false);
    });
  });
});
