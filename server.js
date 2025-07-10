const cluster = require('node:cluster');
const http = require('node:http');
const { availableParallelism } = require('node:os');
const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs');

const numCPUs = availableParallelism();
const PORT = process.env.PORT || 3000;

// Memory monitoring function
function logMemoryUsage(workerId = 'Primary') {
  const memUsage = process.memoryUsage();
  console.log(`[${workerId}] Memory Usage:`, {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
  });
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers for optimal performance`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Monitor worker events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    // Restart the worker for fault tolerance
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  // Memory monitoring for primary process
  setInterval(() => {
    logMemoryUsage('Primary');
  }, 30000); // Log every 30 seconds

} else {
  // Worker process - create HTTP server
  const server = http.createServer((req, res) => {
    // Set CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'build', filePath);

    // Serve static files from build directory
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // If file not found, serve index.html for SPA routing
        if (err.code === 'ENOENT') {
          fs.readFile(path.join(__dirname, 'build', 'index.html'), (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
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
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
  });

  // Memory monitoring for worker processes
  setInterval(() => {
    logMemoryUsage(`Worker-${cluster.worker.id}`);
  }, 30000); // Log every 30 seconds

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM. Shutting down gracefully...`);
    server.close(() => {
      console.log(`Worker ${process.pid} closed server`);
      process.exit(0);
    });
  });
} 