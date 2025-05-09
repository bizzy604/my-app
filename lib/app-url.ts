/**
 * Utility for getting the correct application URL based on environment
 * This ensures email verification links and other URLs are correctly formed
 */

/**
 * Get the base URL for the application based on environment and context
 * - For external/public links (emails, etc.), uses PUBLIC_URL in production
 * - For internal links, determines URL dynamically from request headers when possible
 * - Falls back to appropriate environment variables when headers aren't available
 */
export function getAppBaseUrl(forEmailLink = false): string {
  // For email links in production, always use the public URL
  if (forEmailLink && process.env.NODE_ENV === 'production') {
    return process.env.PUBLIC_URL || 'https://innobid.net';
  }
  
  // For development environment email links
  if (forEmailLink && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // For internal application links, we'll use relative URLs when possible
  // in API handlers and server components, and the code that actually sends
  // requests will determine the correct base URL dynamically
  
  // Default fallback when no better option is available
  // This is mainly used when we need an absolute URL but don't have request headers
  return process.env.PUBLIC_URL || process.env.NEXTAUTH_URL || 'https://innobid.net';
}

/**
 * Create a full URL with the correct base
 * @param path - The path to append to the base URL
 * @param forEmailLink - If true, uses public URL for email links
 */
export function createAppUrl(path: string, forEmailLink = false): string {
  const baseUrl = getAppBaseUrl(forEmailLink);
  // Remove trailing slash from base and leading slash from path if needed
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${normalizedBase}${normalizedPath}`;
}
