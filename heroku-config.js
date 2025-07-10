// Heroku-specific configuration
module.exports = {
  // Heroku automatically sets PORT, so we use that
  port: process.env.PORT || 3000,
  
  // Heroku has limited memory, so we adjust settings
  cluster: {
    // Use fewer workers on Heroku to avoid memory issues
    workers: process.env.WORKERS || 2,
    
    // Lower memory thresholds for Heroku's constraints
    maxMemoryPerWorker: process.env.MAX_MEMORY_PER_WORKER || 256,
    memoryThreshold: process.env.MEMORY_THRESHOLD || 200,
    
    // Shorter restart interval
    restartInterval: process.env.RESTART_INTERVAL || 30,
  },
  
  // Server configuration optimized for Heroku
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Heroku requires 0.0.0.0
    
    // Static file serving
    staticPath: './build',
    
    // Enable compression for better performance
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    
    // Cache control for Heroku's CDN
    cacheControl: {
      static: 'public, max-age=31536000',
      html: 'public, max-age=0, no-cache',
    }
  },
  
  // Monitoring with reduced frequency for Heroku
  monitoring: {
    enabled: process.env.ENABLE_MONITORING !== 'false',
    interval: process.env.MONITORING_INTERVAL || 60000, // 1 minute instead of 30 seconds
    logToFile: false, // Heroku doesn't support file logging
  },
  
  // Performance settings for Heroku
  performance: {
    enableHTTP2: false, // Heroku doesn't support HTTP/2
    maxConnections: process.env.MAX_CONNECTIONS || 500,
    timeout: {
      connection: 30000, // 30 seconds
      request: 15000,    // 15 seconds
    }
  },
  
  // Heroku-specific settings
  heroku: {
    // Enable Heroku's request ID tracking
    enableRequestId: true,
    
    // Use Heroku's logging
    useHerokuLogging: true,
    
    // Health check endpoint for Heroku
    healthCheckPath: '/health',
  }
}; 