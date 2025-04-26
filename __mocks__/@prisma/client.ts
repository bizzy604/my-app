// Manual mock for @prisma/client

// Deep mock using jest-mock-extended or create a basic mock
// Basic mock example:

import { jest } from '@jest/globals';

// Define the mock PrismaClient instance
const prismaMock = {
  // Mock specific models and methods as needed by your tests
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    // ... other user methods
  },
  bid: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    // ... other bid methods
  },
  procurement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    // ... other procurement methods
  },
  vendor: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    // ... other vendor methods
  },
  // Add other models as needed (e.g., document, evaluation)
  document: {
    findMany: jest.fn(),
  },
  evaluation: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  // Mock Prisma utility methods if used directly
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn((callback: (prisma: any) => any) => callback(prismaMock)), // Mock transaction
  // Add other utility methods as needed
};

// Export the mock PrismaClient class constructor
export class PrismaClient {
  constructor() {
    return prismaMock;
  }
}

// Re-export the mock instance for direct use if needed elsewhere (optional)
// export { prismaMock };

// Export other necessary things from @prisma/client if your code imports them directly
// e.g., export const Prisma = { ... };
export const BidStatus = {
  UNDER_REVIEW: 'UNDER_REVIEW',
  TECHNICAL_EVALUATION: 'TECHNICAL_EVALUATION',
  SHORTLISTED: 'SHORTLISTED',
  FINAL_EVALUATION: 'FINAL_EVALUATION',
  AWARDED: 'AWARDED',
  REJECTED: 'REJECTED',
} as const;
