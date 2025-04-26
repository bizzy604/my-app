import Stripe from 'stripe';

// Singleton instance variable
let stripeInstance: Stripe | null = null;

// Function to get or create the Stripe instance
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    // Get the Stripe secret key from environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Determine API key based on environment
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const apiKey = stripeSecretKey || (isDev ? 'sk_test_fake_key_for_testing' : undefined);

    if (!apiKey) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables and not in dev/test mode');
    }

    // Initialize Stripe with the API key
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      // Add custom fetch implementation for testing if needed, or rely on global polyfill
      // httpClient: Stripe.createFetchHttpClient(), // Example if needed
    });
    
    console.log(`Stripe client initialized using ${apiKey === 'sk_test_fake_key_for_testing' ? 'fake test key' : 'real key'}.`);
  }
  return stripeInstance;
}

// Use the actual price IDs
export const INNOBID_STANDARD_PRICE_ID = process.env.STANDARD_PRICE_ID || 'price_1RGfVyFfxdujiyuqt9MDfcpB';
export const INNOBID_AI_PRICE_ID = process.env.AI_PRICE_ID || 'price_1RGfXRFfxdujiyuqF53RNTXK';
