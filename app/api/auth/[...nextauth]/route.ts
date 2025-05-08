// Import the handlers from the new auth.ts file
import { handlers } from "@/lib/auth";

// Export handlers for API routes
export const { GET, POST } = handlers;