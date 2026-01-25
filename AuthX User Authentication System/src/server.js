/**
 * AuthX Server Entry Point
 * Starts the Express server
 */

require('dotenv').config();

const app = require('./app');
const config = require('./config');
const prisma = require('./config/database');

const PORT = config.port;

// Database connection test and server start
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🔐 AuthX Authentication Service                   ║
║                                                       ║
║     Environment: ${config.env.padEnd(37)}║
║     Port: ${String(PORT).padEnd(44)}║
║     API Version: ${config.apiVersion.padEnd(37)}║
║                                                       ║
║     Endpoints:                                        ║
║     • Health: http://localhost:${PORT}/api/${config.apiVersion}/health        ║
║     • Auth:   http://localhost:${PORT}/api/${config.apiVersion}/auth          ║
║     • Users:  http://localhost:${PORT}/api/${config.apiVersion}/users         ║
║     • Roles:  http://localhost:${PORT}/api/${config.apiVersion}/roles         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        await prisma.$disconnect();
        console.log('Database connection closed');
        
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
