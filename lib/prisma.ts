import { PrismaClient } from '@prisma/client'

// Create a base prisma client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

// Define the type for our global prisma client
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Global variable to hold the prisma instance across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClientSingleton }

// Export the prisma client with singleton pattern
export const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Keep the connection alive in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Helper function to set the current user context for RLS
 * Call this before performing database operations that should respect RLS
 */
export async function setRLSContext(userId: number | string | null | undefined) {
  if (userId) {
    try {
      // Convert userId to string to ensure compatibility
      const userIdStr = userId.toString()
      // Set the PostgreSQL session variables for RLS
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userIdStr}, true)`
    } catch (error) {
      console.error('Error setting RLS context:', error)
    }
  }
}

/**
 * Helper function to clear the RLS context
 * Call this after completing operations if needed
 */
export async function clearRLSContext() {
  try {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', true)`
  } catch (error) {
    console.error('Error clearing RLS context:', error)
  }
}

export default prisma