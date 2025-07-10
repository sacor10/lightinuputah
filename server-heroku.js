const cluster = require('node:cluster');
const http = require('node:http');
const { availableParallelism } = require('node:os');
const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');
const config = require('./heroku-config');

// Heroku has limited resources, so we use fewer workers
const numCPUs = Math.min(config.cluster.workers, availableParallelism());
const PORT = config.server.port;

// Memory monitoring optimized for Heroku
class HerokuMemoryManager {
  constructor(workerId) {
    this.workerId = workerId;
    this.startTime = Date.now();
    this.restartCount = 0;
    this.maxRestarts = 5; // Lower for Heroku
  }

  logMemoryUsage() {
    const memUsage = process.memoryUsage();
    const usage = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      uptime: Math.round((Date.now() - this.startTime) / 1000)
    };

    // Use Heroku's logging format
    console.log(`[${this.workerId}] Memory: RSS=${usage.rss}MB, Heap=${usage.heapUsed}MB/${usage.heapTotal}MB, Uptime=${usage.uptime}s`);

    // Check if memory usage exceeds threshold
    if (usage.heapUsed > config.cluster.memoryThreshold) {
      console.warn(`[${this.workerId}] Memory threshold exceeded! Heap used: ${usage.heapUsed}MB`);
      this.handleMemoryPressure();
    }

    return usage;
  }

  handleMemoryPressure() {
    if (this.restartCount < this.maxRestarts) {
      console.log(`[${this.workerId}] Initiating graceful restart due to memory pressure...`);
      this.restartCount++;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log(`[${this.workerId}] Garbage collection performed`);
      }
      
      // Restart worker after a short delay
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } else {
      console.error(`[${this.workerId}] Max restart limit reached. Manual intervention required.`);
    }
  }

  startMonitoring() {
    if (config.monitoring.enabled) {
      setInterval(() => {
        this.logMemoryUsage();
      }, config.monitoring.interval);
    }
  }
}

// Compression middleware
function compressResponse(data, acceptEncoding) {
  if (!config.server.enableCompression) return data;
  
  if (acceptEncoding && acceptEncoding.includes('gzip')) {
    return zlib.gzipSync(data);
  } else if (acceptEncoding && acceptEncoding.includes('deflate')) {
    return zlib.deflateSync(data);
  }
  return data;
}



// Heroku request ID tracking
function addRequestId(req, res) {
  if (config.heroku.enableRequestId) {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', requestId);
    return requestId;
  }
  return null;
}

if (cluster.isPrimary) {
  console.log(`🚀 Heroku Primary ${process.pid} is running`);
  console.log(`📊 Starting ${numCPUs} workers for Heroku optimization`);
  console.log(`⚙️  Configuration:`, {
    workers: numCPUs,
    maxMemoryPerWorker: config.cluster.maxMemoryPerWorker + 'MB',
    memoryThreshold: config.cluster.memoryThreshold + 'MB',
    port: PORT
  });

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Monitor worker events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    // Restart the worker for fault tolerance
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });

  // Memory monitoring for primary process
  const primaryMemoryManager = new HerokuMemoryManager('Primary');
  primaryMemoryManager.startMonitoring();

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('🛑 Primary process received SIGTERM. Shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

} else {
  // Worker process - create HTTP server
  const memoryManager = new HerokuMemoryManager(`Worker-${cluster.worker.id}`);
  memoryManager.startMonitoring();

  const server = http.createServer((req, res) => {
    // Add request ID for tracking
    const requestId = addRequestId(req, res);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check endpoint for Heroku
    if (req.url === config.heroku.healthCheckPath) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        worker: cluster.worker.id,
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        requestId
      }));
      return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(__dirname, config.server.staticPath, filePath);

    // Serve static files from build directory
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        // If file not found, serve index.html for SPA routing
        if (err.code === 'ENOENT') {
          fs.readFile(path.join(__dirname, config.server.staticPath, 'index.html'), (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Cache-Control': config.server.cacheControl.html
              });
              res.end(data);
            }
          });
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
        }
      } else {
        // Determine content type based on file extension
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        switch (ext) {
          case '.html':
            contentType = 'text/html';
            break;
          case '.js':
            contentType = 'application/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.ico':
            contentType = 'image/x-icon';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
        }

        // Compress response if supported
        const compressedData = compressResponse(data, req.headers['accept-encoding']);
        
        // Prepare headers
        const headers = {
          'Content-Type': contentType,
          'Content-Length': compressedData.length
        };
        
        // Set cache headers
        if (ext === '.html') {
          headers['Cache-Control'] = config.server.cacheControl.html;
        } else if (['.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.svg'].includes(ext)) {
          headers['Cache-Control'] = config.server.cacheControl.static;
        }
        
        // Set compression header if needed
        if (compressedData !== data) {
          headers['Content-Encoding'] = req.headers['accept-encoding'].includes('gzip') ? 'gzip' : 'deflate';
        }

        res.writeHead(200, headers);
        res.end(compressedData);
      }
    });
  });

  // Set server timeouts for Heroku
  server.timeout = config.performance.timeout.request;
  server.keepAliveTimeout = config.performance.timeout.connection;

  server.listen(PORT, config.server.host, () => {
    console.log(`🎯 Heroku Worker ${process.pid} started on port ${PORT}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log(`🛑 Worker ${process.pid} received SIGTERM. Shutting down gracefully...`);
    server.close(() => {
      console.log(`✅ Worker ${process.pid} closed server`);
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`❌ Worker ${process.pid} uncaught exception:`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`❌ Worker ${process.pid} unhandled rejection at:`, promise, 'reason:', reason);
    process.exit(1);
  });
} 