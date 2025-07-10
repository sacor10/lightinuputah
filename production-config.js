// Production Configuration
module.exports = {
  // Production Environment Variables
  NODE_ENV: 'production',
  PORT: process.env.PORT || 3000,

  // Cluster Configuration
  WORKERS: process.env.WORKERS || 4,
  MEMORY_THRESHOLD: process.env.MEMORY_THRESHOLD || 400,
  MAX_MEMORY_PER_WORKER: process.env.MAX_MEMORY_PER_WORKER || 512,
  RESTART_INTERVAL: process.env.RESTART_INTERVAL || 60,

  // Performance Settings
  ENABLE_COMPRESSION: process.env.ENABLE_COMPRESSION !== 'false',
  ENABLE_MONITORING: process.env.ENABLE_MONITORING !== 'false',
  MONITORING_INTERVAL: process.env.MONITORING_INTERVAL || 30000,
  MAX_CONNECTIONS: process.env.MAX_CONNECTIONS || 1000,

  // Server Settings
  HOST: process.env.HOST || '0.0.0.0',
  ENABLE_HTTP2: process.env.ENABLE_HTTP2 === 'true',

  // Logging
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
}; 