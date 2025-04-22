import Stripe from 'stripe';

// Get the Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// In development, we can use a fake key to prevent crashes
const isDev = process.env.NODE_ENV === 'development';
const apiKey = stripeSecretKey || (isDev ? 'sk_test_fake_key_for_development_only' : undefined);

if (!apiKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables and not in development mode');
}

// Initialize Stripe with the API key
export const stripe = new Stripe(apiKey, {
  apiVersion: '2023-10-16',
  // In development with a fake key, we'll just log API calls instead of making them
  ...(isDev && !stripeSecretKey ? { 
    httpClient: {
      fetchAsync: async (path: string) => {
        return { 
          status: 200, 
          body: '{"object": "list", "data": [], "url": null}',
          headers: new Headers()
        };
      }
    }
  } : {})
});

// Use the actual price IDs
export const INNOBID_STANDARD_PRICE_ID = process.env.STANDARD_PRICE_ID || 'price_1RGfVyFfxdujiyuqt9MDfcpB';
export const INNOBID_AI_PRICE_ID = process.env.AI_PRICE_ID || 'price_1RGfXRFfxdujiyuqF53RNTXK';
