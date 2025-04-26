import { INNOBID_STANDARD_PRICE_ID, INNOBID_AI_PRICE_ID } from '@/lib/stripe';

// Mock stripe module
jest.mock('stripe', () => {
  return jest.fn(() => ({
    // Mock stripe methods that might be used in the application
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test-session' }),
      },
    },
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
      list: jest.fn().mockResolvedValue({ data: [] }),
      update: jest.fn().mockResolvedValue({ id: 'cus_mock123', metadata: { updated: true } }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ 
        id: 'sub_mock123',
        status: 'active',
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }),
      list: jest.fn().mockResolvedValue({ data: [] }),
      update: jest.fn().mockResolvedValue({ id: 'sub_mock123', status: 'active' }),
      cancel: jest.fn().mockResolvedValue({ id: 'sub_mock123', status: 'canceled' }),
    }
  }));
});

// Mock environment for testing
const originalEnv = process.env;

describe('Stripe Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports the correct price IDs', () => {
    // These are the default values if env variables are not set
    expect(INNOBID_STANDARD_PRICE_ID).toBeDefined();
    expect(INNOBID_AI_PRICE_ID).toBeDefined();
  });

  it('uses environment variables for price IDs when available', () => {
    process.env.STANDARD_PRICE_ID = 'test_standard_price';
    process.env.AI_PRICE_ID = 'test_ai_price';
    
    // Need to re-import to use updated environment variables
    jest.resetModules();
    const { INNOBID_STANDARD_PRICE_ID, INNOBID_AI_PRICE_ID } = require('@/lib/stripe');
    
    expect(INNOBID_STANDARD_PRICE_ID).toBe('test_standard_price');
    expect(INNOBID_AI_PRICE_ID).toBe('test_ai_price');
  });
});
