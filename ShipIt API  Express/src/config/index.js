/**
 * Application Configuration
 * 
 * This module demonstrates environment-based configuration.
 * Values are loaded from environment variables with sensible defaults.
 * 
 * WORKSHOP NOTE: This is how production apps handle different environments!
 */

require('dotenv').config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // API Configuration
  api: {
    prefix: '/api/v1',
    version: '1.0.0'
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Logging Configuration
  logging: {
    // Use 'combined' for production (more detailed), 'dev' for development (colored)
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Feature Flags (demonstrate environment-based features)
  features: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableDocs: process.env.NODE_ENV !== 'production'
  }
};

// Validate required configurations in production
if (config.env === 'production') {
  const requiredEnvVars = ['NODE_ENV'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}

// Log configuration on startup (only in development)
if (config.env === 'development') {
  console.log('📋 Configuration loaded:');
  console.log(`   Environment: ${config.env}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   API Version: ${config.api.version}`);
}

module.exports = config;
