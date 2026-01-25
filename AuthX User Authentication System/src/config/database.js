/**
 * Database Configuration
 * Prisma client setup with connection management
 */

const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty',
});

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
  process.exit(1);
});

module.exports = prisma;
