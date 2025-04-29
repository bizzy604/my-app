// Custom NextAuth v5 compatible Prisma adapter
import { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

// Helper to convert DB user to AdapterUser format
const formatUser = (user: any): AdapterUser => {
  return {
    ...user,
    id: user.id.toString(),
    // Make sure emailVerified is a Date if it exists and is not null
    emailVerified: user.emailVerified 
      ? user.emailVerified instanceof Date 
        ? user.emailVerified 
        : new Date(user.emailVerified)
      : null
  };
};

/**
 * NextAuth v5-compatible Prisma adapter
 * This adapter was customized to work with the existing database schema,
 * using JWT for session management rather than database sessions
 */
export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  // Create local prisma instance to ensure we're not affected by proxy issues
  const prisma = p;

  return {
    createUser: async (data: Omit<AdapterUser, "id">) => {
      try {
        // Note: This will only be called for providers without credentials
        // For example, when a user signs in with Google for the first time
        // Insert the user - executeRaw doesn't return the inserted record
        await prisma.$executeRaw(
          Prisma.sql`
            INSERT INTO "User" ("email", "emailVerified", "name", "image", "password")
            VALUES (${data.email}, ${data.emailVerified || false}, ${data.name}, ${data.image}, ${''})
          `
        );
        
        // Get the created user
        const users = await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "User" WHERE "email" = ${data.email}`
        ) as any[];
        
        if (!users || users.length === 0) throw new Error("Failed to create user");
        
        const createdUser = users[0];
        
        // Convert to NextAuth AdapterUser format
        return formatUser(createdUser);
      } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
      }
    },
    
    getUser: async (id: string) => {
      try {
        const result = await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "User" WHERE "id" = ${parseInt(id, 10)}`
        ) as any[];
        
        if (!result || result.length === 0) return null;
        
        const user = result[0];
        
        // Convert to NextAuth AdapterUser format
        return formatUser(user);
      } catch (error) {
        console.error("Error in getUser:", error);
        return null;
      }
    },
    
    getUserByEmail: async (email: string) => {
      try {
        const result = await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "User" WHERE "email" = ${email}`
        ) as any[];
        
        if (!result || result.length === 0) return null;
        
        const user = result[0];
        
        // Convert to NextAuth AdapterUser format
        return formatUser(user);
      } catch (error) {
        console.error("Error in getUserByEmail:", error);
        return null;
      }
    },
    
    getUserByAccount: async (providerAccount: { provider: string; providerAccountId: string }) => {
      // Since we don't have an Account table, we can't directly link providers to users
      // We'll handle this differently with credential-based auth
      return null;
    },
    
    updateUser: async (user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> => {
      try {
        const { id, ...data } = user;
        const userId = parseInt(id, 10);
        
        // First, get the current user to make sure it exists and to have a base to update
        const currentUserResult = await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "User" WHERE "id" = ${userId}`
        ) as any[];
        
        if (!currentUserResult || currentUserResult.length === 0) {
          throw new Error(`User with ID ${id} not found`);
        }
        
        const currentUser = currentUserResult[0];
        
        // Prepare the SET clauses for the SQL update
        const setClauses = Object.entries(data)
          .filter(([_, value]) => value !== undefined) // Skip undefined values
          .map(([key, value]) => {
            if (value === null) {
              return `"${key}" = NULL`;
            } else if (typeof value === 'string') {
              return `"${key}" = '${value.replace(/'/g, "''")}'`; // Escape single quotes
            } else if (value instanceof Date) {
              return `"${key}" = '${value.toISOString()}'`;
            } else {
              return `"${key}" = ${value}`;
            }
          })
          .join(", ");
          
        // Only update if there are fields to update
        if (setClauses) {
          await prisma.$executeRaw(
            Prisma.sql`
              UPDATE "User"
              SET ${Prisma.raw(setClauses)}
              WHERE "id" = ${userId}
            `
          );
        }
        
        // Get the updated user
        const updatedUserResult = await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "User" WHERE "id" = ${userId}`
        ) as any[];
        
        if (!updatedUserResult || updatedUserResult.length === 0) {
          throw new Error(`Failed to retrieve updated user with ID ${id}`);
        }
        
        // Return the updated user with proper formatting
        return formatUser(updatedUserResult[0]);
      } catch (error) {
        console.error("Error in updateUser:", error);
        throw error; // Re-throw to allow NextAuth to handle it
      }
    },
    
    deleteUser: async (id: string) => {
      try {
        await prisma.$executeRaw(
          Prisma.sql`DELETE FROM "User" WHERE "id" = ${parseInt(id, 10)}`
        );
        return;
      } catch (error) {
        console.error("Error in deleteUser:", error);
        throw error;
      }
    },
    
    // Session and account functions - these are minimal implementations since we're using JWT sessions
    
    linkAccount: async (data: AdapterAccount) => {
      // Since we don't have an Account table, we'll return a mock account
      // In practice with JWT auth, you should persist this data in the JWT token
      return data;
    },
    
    unlinkAccount: async () => {
      // No operation needed with JWT auth
      return;
    },
    
    createSession: async (data: { sessionToken: string; userId: string; expires: Date }) => {
      // For JWT auth, we don't need to create sessions in DB
      return data;
    },
    
    getSessionAndUser: async (sessionToken: string) => {
      // For JWT auth, we pull the data from the token directly
      return null; // Let NextAuth handle JWT sessions
    },
    
    updateSession: async (data: Partial<AdapterSession> & { sessionToken: string }) => {
      // For JWT auth, session updates are handled in session callbacks
      return null; // Let NextAuth handle JWT sessions
    },
    
    deleteSession: async () => {
      // No operation needed with JWT auth
      return;
    },
    
    createVerificationToken: async (data: { identifier: string; token: string; expires: Date }) => {
      // Store verification token in the User table
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "User"
          SET "emailVerificationToken" = ${data.token},
              "emailVerificationTokenExpiry" = ${data.expires}
          WHERE "email" = ${data.identifier}
        `
      );
      
      return data;
    },
    
    useVerificationToken: async (params: { identifier: string; token: string }) => {
      try {
        // Find user with matching email and token
        const users = await prisma.$queryRaw(
          Prisma.sql`
            SELECT * FROM "User" 
            WHERE "email" = ${params.identifier} 
            AND "emailVerificationToken" = ${params.token}
          `
        ) as any[];
        
        if (!users || users.length === 0) return null;
        
        const user = users[0];
        
        // Token has been used, clear it and update emailVerified
        await prisma.$executeRaw(
          Prisma.sql`
            UPDATE "User" 
            SET "emailVerificationToken" = NULL,
                "emailVerificationTokenExpiry" = NULL,
                "emailVerified" = true
            WHERE "email" = ${params.identifier}
          `
        );
        
        return {
          identifier: params.identifier,
          token: params.token,
          expires: user.emailVerificationTokenExpiry
        };
      } catch (error) {
        console.error("Error in useVerificationToken:", error);
        return null;
      }
    },
  };
}
