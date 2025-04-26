import { authOptions } from '@/lib/auth';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Auth Configuration', () => {
  describe('JWT Callback', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('assigns user data to token on sign in', async () => {
      const mockUser = {
        id: 123,
        role: 'VENDOR',
        updatedAt: new Date('2023-01-01')
      };
      
      const token = {};
      const result = await authOptions.callbacks.jwt({ 
        token, 
        user: mockUser,
        trigger: 'signIn'
      } as any);
      
      expect(result).toEqual(expect.objectContaining({
        id: 123,
        role: 'VENDOR',
        userUpdatedAt: mockUser.updatedAt.getTime(),
        subscriptionLastChecked: expect.any(Number)
      }));
    });

    it('adds subscription data for PROCUREMENT users', async () => {
      // Mock the user with PROCUREMENT role
      const mockUser = {
        id: 456,
        role: 'PROCUREMENT',
        updatedAt: new Date('2023-01-01')
      };
      
      // Mock the prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        subscriptionStatus: 'active',
        subscriptionTier: 'ai'
      });
      
      const token = {};
      const result = await authOptions.callbacks.jwt({ 
        token, 
        user: mockUser,
        trigger: 'signIn'
      } as any);
      
      expect(result).toEqual(expect.objectContaining({
        id: 456,
        role: 'PROCUREMENT',
        hasActiveSubscription: true,
        subscriptionTier: 'ai'
      }));
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 456 },
        select: { 
          subscriptionStatus: true,
          subscriptionTier: true
        }
      });
    });

    it('handles database errors when fetching subscription data', async () => {
      // Mock the user with PROCUREMENT role
      const mockUser = {
        id: 789,
        role: 'PROCUREMENT',
        updatedAt: new Date('2023-01-01')
      };
      
      // Mock database error
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection error')
      );
      
      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const token = {};
      const result = await authOptions.callbacks.jwt({ 
        token, 
        user: mockUser,
        trigger: 'signIn'
      } as any);
      
      expect(result).toEqual(expect.objectContaining({
        id: 789,
        role: 'PROCUREMENT',
        hasActiveSubscription: false
      }));
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Session Callback', () => {
    it('assigns token data to session', async () => {
      const token = {
        id: 123,
        role: 'VENDOR',
        hasActiveSubscription: true,
        subscriptionTier: 'standard',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const session = {
        user: {
          name: 'Original Name',
          email: 'original@example.com'
        }
      };
      
      const result = await authOptions.callbacks.session({ 
        session, 
        token
      } as any);
      
      expect(result.user).toEqual(expect.objectContaining({
        id: 123,
        role: 'VENDOR',
        hasActiveSubscription: true,
        subscriptionTier: 'standard',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
  });
});
