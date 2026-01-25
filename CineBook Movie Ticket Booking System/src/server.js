/**
 * CineBook Server
 */

require('dotenv').config();

const app = require('./app');
const config = require('./config');
const prisma = require('./config/database');

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🎬 CineBook - Movie Ticket Booking System         ║
║                                                       ║
║     Environment: ${config.env.padEnd(37)}║
║     Port: ${String(config.port).padEnd(44)}║
║                                                       ║
║     Endpoints:                                        ║
║     • Health:   /api/v1/health                        ║
║     • Movies:   /api/v1/movies                        ║
║     • Theaters: /api/v1/theaters                      ║
║     • Shows:    /api/v1/shows                         ║
║     • Bookings: /api/v1/bookings                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
