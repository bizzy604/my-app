/**
 * Utility for getting the correct application URL based on environment
 * This ensures email verification links and other URLs are correctly formed
 */

/**
 * Get the base URL for the application based on environment
 * In production: Uses NEXTAUTH_URL (https://innobid.net)
 * In development: Uses NEXT_PUBLIC_APP_URL for email links, NEXTAUTH_URL for auth
 */
export function getAppBaseUrl(forEmailLink = false): string {
  // For email verification links and similar, even in development,
  // we want to use the production URL so users can click them
  if (process.env.NODE_ENV !== 'production' && forEmailLink) {
    return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  
  // For other operations, use the standard NextAuth URL
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

/**
 * Create a full URL with the correct base
 */
export function createAppUrl(path: string, forEmailLink = false): string {
  const baseUrl = getAppBaseUrl(forEmailLink);
  // Remove trailing slash from base and leading slash from path if needed
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${normalizedBase}${normalizedPath}`;
}
