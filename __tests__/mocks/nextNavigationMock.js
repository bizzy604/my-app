// Mock for next/navigation

// Create mock functions for navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

// Mock the router
const useRouter = jest.fn().mockReturnValue({
  push: mockPush,
  back: mockBack,
  replace: mockReplace,
  refresh: mockRefresh,
  prefetch: mockPrefetch,
  pathname: '/mock-path',
  query: {}
});

// Mock other navigation hooks
const usePathname = jest.fn().mockReturnValue('/mock-path');
const useSearchParams = jest.fn().mockReturnValue(new URLSearchParams());
const useParams = jest.fn().mockReturnValue({});

// Mock redirect
const redirect = jest.fn();

// Export all mock functions and hooks
module.exports = {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  redirect
};
