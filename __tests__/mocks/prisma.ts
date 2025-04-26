// Mock implementations of Prisma types and enums used in tests

// Mock the BidStatus enum from @prisma/client
export const BidStatus = {
  UNDER_REVIEW: 'UNDER_REVIEW',
  TECHNICAL_EVALUATION: 'TECHNICAL_EVALUATION',
  SHORTLISTED: 'SHORTLISTED',
  FINAL_EVALUATION: 'FINAL_EVALUATION',
  AWARDED: 'AWARDED',
  REJECTED: 'REJECTED'
};

// Mock the Role enum from @prisma/client
export const Role = {
  ADMIN: 'ADMIN',
  PROCUREMENT: 'PROCUREMENT',
  VENDOR: 'VENDOR',
  CITIZEN: 'CITIZEN'
};

// Mock the prisma client itself
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  bid: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn()
  },
  tender: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  evaluationStage: {
    create: jest.fn(),
    findFirst: jest.fn()
  },
  bidEvaluationLog: {
    create: jest.fn()
  },
  notification: {
    create: jest.fn()
  }
};
