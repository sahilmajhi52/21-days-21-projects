/**
 * Server Entry Point
 * 
 * WORKSHOP NOTE: This is where the magic happens!
 * The server starts listening for requests here.
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// Start the server
const server = app.listen(config.port, () => {
  console.log('');
  console.log('🚀 ════════════════════════════════════════════════════════');
  console.log('');
  console.log(`   ShipIt API v${config.api.version}`);
  console.log('');
  console.log(`   ✅ Server running on port ${config.port}`);
  console.log(`   📍 Environment: ${config.env}`);
  console.log(`   🌐 URL: http://localhost:${config.port}`);
  console.log('');
  console.log('   Endpoints:');
  console.log(`   • Health:  http://localhost:${config.port}/health`);
  console.log(`   • API:     http://localhost:${config.port}${config.api.prefix}`);
  console.log('');
  console.log('════════════════════════════════════════════════════════ 🚀');
  console.log('');
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

// Handle shutdown signals (important for production!)
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    logger.info('Graceful shutdown completed.');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason: reason?.message || reason });
  process.exit(1);
});

module.exports = server;
