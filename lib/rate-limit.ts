/**
 * Simple in-memory rate limiting implementation
 * Adapted from Next.js examples
 */

type Options = {
  interval: number
  uniqueTokenPerInterval: number
}

export function rateLimit(options: Options) {
  const { interval, uniqueTokenPerInterval } = options
  const tokenCache = new Map<string, number[]>()
  
  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || []
        const currentTime = Date.now()
        const timeWindow = currentTime - interval
        
        // Filter out tokens older than the current interval
        const filteredTokens = tokenCount.filter((timestamp) => timestamp > timeWindow)
        
        // Check if we've exceeded the limit
        if (filteredTokens.length >= limit) {
          reject(new Error('Rate limit exceeded'))
          return
        }
        
        // Add the current request timestamp
        filteredTokens.push(currentTime)
        
        // Update the token cache
        tokenCache.set(token, filteredTokens)
        
        // Clean up old tokens periodically
        if (tokenCache.size > uniqueTokenPerInterval) {
          const entries = Array.from(tokenCache.entries());
          const oldestToken = entries.sort((a, b) => {
            return Math.min(...a[1]) - Math.min(...b[1])
          })[0][0]
          
          tokenCache.delete(oldestToken)
        }
        
        resolve()
      }),
  }
}
