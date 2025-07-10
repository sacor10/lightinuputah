module.exports = {
  // Cluster configuration
  cluster: {
    // Number of workers (defaults to CPU cores)
    workers: process.env.WORKERS || require('node:os').availableParallelism(),
    
    // Memory limits per worker (in MB)
    maxMemoryPerWorker: process.env.MAX_MEMORY_PER_WORKER || 512,
    
    // Restart worker if memory usage exceeds this threshold (in MB)
    memoryThreshold: process.env.MEMORY_THRESHOLD || 400,
    
    // Restart interval for memory cleanup (in minutes)
    restartInterval: process.env.RESTART_INTERVAL || 60,
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    
    // Static file serving
    staticPath: './build',
    
    // Compression settings
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    
    // Caching headers
    cacheControl: {
      static: 'public, max-age=31536000', // 1 year for static assets
      html: 'public, max-age=0, no-cache', // No cache for HTML
    }
  },
  
  // Memory monitoring
  monitoring: {
    enabled: process.env.ENABLE_MONITORING !== 'false',
    interval: process.env.MONITORING_INTERVAL || 30000, // 30 seconds
    logToFile: process.env.LOG_TO_FILE === 'true',
  },
  
  // Performance optimization
  performance: {
    // Enable HTTP/2 if available
    enableHTTP2: process.env.ENABLE_HTTP2 === 'true',
    
    // Connection pooling
    maxConnections: process.env.MAX_CONNECTIONS || 1000,
    
    // Timeout settings
    timeout: {
      connection: 60000, // 60 seconds
      request: 30000,    // 30 seconds
    }
  }
}; 