// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Restore fetch polyfill
import { fetch, Headers, Request, Response } from 'undici';

global.fetch = fetch as any;
global.Headers = Headers as any;
global.Request = Request as any;
global.Response = Response as any;

// Mock next/server for Jest environment
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: jest.fn((data) => data),
    redirect: jest.fn((url) => ({ url })),
    next: jest.fn(() => ({}))
    // Add other NextResponse methods if needed by your tests
  },
}));

// Prisma client is now handled by the manual mock in __mocks__/@prisma/client.ts
