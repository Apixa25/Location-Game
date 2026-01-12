/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma client instance is used throughout the application.
 * Prevents connection pool exhaustion during development with hot reloading.
 */

import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Extend the global object to store prisma client
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Create a Prisma client with logging based on environment
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: config.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });
}

/**
 * Get or create the Prisma client singleton
 */
export const prisma = global.__prisma ?? createPrismaClient();

// Store in global for hot reloading in development
if (config.isDevelopment) {
  global.__prisma = prisma;
}

export default prisma;

