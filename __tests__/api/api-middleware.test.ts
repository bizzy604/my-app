import { checkSubscriptionTier } from '@/lib/api-middleware';

// Mock the API Token interface from api-auth
interface ApiToken {
  userId: number; // Changed from string to number to match actual implementation
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Mock the api-auth module
jest.mock('@/lib/api-auth', () => ({
  ApiToken: {}
}));

describe('API Middleware Functions', () => {
  describe('checkSubscriptionTier', () => {
    it('allows standard tier access for any active subscription', async () => {
      const token: ApiToken = {
        userId: 123, // Changed from string to number
        email: 'user@example.com',
        role: 'VENDOR',
        iat: 0,
        exp: 0
      };

      const hasAccess = await checkSubscriptionTier(token, 'standard');
      expect(hasAccess).toBe(true);
    });

    it('restricts AI tier access to procurement officers only', async () => {
      const vendorToken: ApiToken = {
        userId: 456, // Changed from string to number
        email: 'vendor@example.com',
        role: 'VENDOR',
        iat: 0,
        exp: 0
      };

      const procurementToken: ApiToken = {
        userId: 789, // Changed from string to number
        email: 'procurement@example.com',
        role: 'PROCUREMENT',
        iat: 0,
        exp: 0
      };

      const vendorHasAccess = await checkSubscriptionTier(vendorToken, 'ai');
      const procurementHasAccess = await checkSubscriptionTier(procurementToken, 'ai');

      expect(vendorHasAccess).toBe(false);
      expect(procurementHasAccess).toBe(true);
    });
  });
});
