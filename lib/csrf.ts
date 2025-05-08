import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  try {
    const token = randomBytes(32).toString('hex');
    return token;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    throw new Error('Failed to generate CSRF token');
  }
}

// Generate a new token for each server start
export const CSRF_TOKEN = generateCSRFToken();