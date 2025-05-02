/**
 * Utility for getting the correct application URL based on environment
 * This ensures email verification links and other URLs are correctly formed
 */

/**
 * Get the base URL for the application based on environment and context
 * - For auth redirects: Uses localhost:3000 in production (behind nginx)
 * - For email links and public URLs: Uses PUBLIC_URL in production
 * - For development: Uses NEXT_PUBLIC_APP_URL for email links, NEXTAUTH_URL for auth
 */
export function getAppBaseUrl(forEmailLink = false): string {
  // For production environment
  if (process.env.NODE_ENV === 'production') {
    // For email links and public URLs, use PUBLIC_URL
    if (forEmailLink) {
      return process.env.PUBLIC_URL || 'https://innobid.net';
    }
    // For auth redirects, use localhost when behind nginx
    return 'http://localhost:3000';
  }
  
  // For development environment
  if (forEmailLink && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Default fallback for local development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
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
