/**
 * Server Entry Point
 * ScribeBoard API
 */

const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════╗');
      console.log('║                                                       ║');
      console.log('║     📝 ScribeBoard API - Blog CMS Backend            ║');
      console.log('║                                                       ║');
      console.log(`║     Environment: ${config.env.padEnd(36)}║`);
      console.log(`║     Port: ${config.port.toString().padEnd(43)}║`);
      console.log(`║     API Version: ${config.api.version.padEnd(36)}║`);
      console.log('║                                                       ║');
      console.log('║     Endpoints:                                        ║');
      console.log(`║     • Health:     http://localhost:${config.port}/api/v1/health  ║`);
      console.log(`║     • Auth:       http://localhost:${config.port}/api/v1/auth    ║`);
      console.log(`║     • Posts:      http://localhost:${config.port}/api/v1/posts   ║`);
      console.log(`║     • Categories: http://localhost:${config.port}/api/v1/categories║`);
      console.log('║                                                       ║');
      console.log('╚═══════════════════════════════════════════════════════╝');
      console.log('');
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
