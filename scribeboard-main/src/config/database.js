/**
 * Database Configuration
 * Prisma Client Setup
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error']
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('📤 Database disconnected');
};

const closeDB = async () => {
  await prisma.$disconnect();
  console.log('📤 Database disconnected');
};

module.exports = { prisma, connectDB, disconnectDB };
