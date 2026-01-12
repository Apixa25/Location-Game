/**
 * Black Bart's Gold - Backend API
 *
 * Entry point for the Express server.
 * Initializes database connection and starts listening.
 */

import { createApp } from './app';
import { config, validateConfig } from './config';
import { prisma } from './utils/prisma';

/**
 * Start the server
 */
async function main(): Promise<void> {
  console.log('🏴‍☠️ Starting Black Bart\'s Gold API...');

  // Validate configuration
  validateConfig();

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Create Express app
  const app = createApp();

  // Start listening
  const server = app.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏴‍☠️ BLACK BART'S GOLD API SERVER                         ║
║                                                            ║
║   Environment: ${config.env.padEnd(41)}║
║   Port:        ${String(config.port).padEnd(41)}║
║   Health:      http://localhost:${config.port}/health${' '.repeat(17)}║
║   API Base:    http://localhost:${config.port}/api/v1${' '.repeat(15)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GRACEFUL SHUTDOWN
  // ─────────────────────────────────────────────────────────────────────────

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      console.log('HTTP server closed');

      await prisma.$disconnect();
      console.log('Database disconnected');

      console.log('👋 Goodbye, matey!');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Run the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

