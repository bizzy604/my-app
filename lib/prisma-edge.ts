import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient as PrismaEdgeClient } from '@prisma/client/edge'

// Determine if we're in an Edge Runtime environment
export const isEdgeRuntime = () => {
  try {
    // Next.js sets this process.env variable in Edge Runtime
    return process.env.NEXT_RUNTIME === 'edge'
  } catch {
    // If we can't access process.env, assume we're in Edge
    return true
  }
}

// Singleton for the Edge-compatible Prisma client
let prismaEdge: PrismaClient | null = null

// Function to create or return an Edge-compatible Prisma client
export function getPrismaEdge() {
  if (prismaEdge) {
    return prismaEdge
  }

  try {
    // Get the database connection string
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
    
    if (!connectionString) {
      throw new Error('Missing database connection string')
    }
    
    // Create a connection pool for PostgreSQL
    const pool = new Pool({ connectionString })
    
    // Create a Neon adapter for Prisma
    const adapter = new PrismaNeon(pool)
    
    // Create a new Prisma client using the edge client with the adapter
    prismaEdge = new PrismaEdgeClient({ adapter })

    console.log('Edge-compatible Prisma client initialized')
    return prismaEdge
  } catch (error) {
    console.error('Failed to initialize Edge-compatible Prisma client:', error)
    throw error
  }
}
