const cluster = require('cluster');
const os = require('os');
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Heroku-specific configuration
const PORT = process.env.PORT || 3000;
const WORKER_COUNT = process.env.WEB_CONCURRENCY || os.cpus().length;
const MEMORY_LIMIT = process.env.MEMORY_LIMIT || 512; // MB
const RESTART_INTERVAL = process.env.RESTART_INTERVAL || 24 * 60 * 60 * 1000; // 24 hours

if (cluster.isMaster) {
    console.log(`[Primary] Master process ${process.pid} is running`);
    console.log(`[Primary] Starting ${WORKER_COUNT} workers`);
    console.log(`[Primary] Memory limit: ${MEMORY_LIMIT}MB`);
    console.log(`[Primary] Restart interval: ${RESTART_INTERVAL / (60 * 60 * 1000)} hours`);

    // Track worker processes
    const workers = new Map();
    let workerId = 1;

    // Function to create a new worker
    function createWorker() {
        const worker = cluster.fork({
            WORKER_ID: workerId,
            NODE_ENV: process.env.NODE_ENV || 'production'
        });

        workers.set(worker.id, {
            id: workerId,
            startTime: Date.now(),
            restartCount: 0
        });

        console.log(`[Primary] Started worker ${workerId} (PID: ${worker.process.pid})`);
        workerId++;

        // Handle worker messages
        worker.on('message', (msg) => {
            if (msg.type === 'memory_usage') {
                const workerInfo = workers.get(worker.id);
                if (workerInfo) {
                    workerInfo.memoryUsage = msg.memory;
                    workerInfo.lastUpdate = Date.now();
                }
            }
        });

        // Handle worker exit
        worker.on('exit', (code, signal) => {
            const workerInfo = workers.get(worker.id);
            if (workerInfo) {
                console.log(`[Primary] Worker ${workerInfo.id} (PID: ${worker.process.pid}) exited with code ${code} and signal ${signal}`);
                workers.delete(worker.id);
            }

            // Restart worker after a short delay
            setTimeout(() => {
                console.log(`[Primary] Restarting worker ${workerInfo?.id || 'unknown'}`);
                createWorker();
            }, 1000);
        });

        return worker;
    }

    // Start initial workers
    for (let i = 0; i < WORKER_COUNT; i++) {
        createWorker();
    }

    // Memory monitoring and worker management
    setInterval(() => {
        console.log(`[Primary] Active workers: ${workers.size}`);
        
        workers.forEach((workerInfo, workerId) => {
            const worker = cluster.workers[workerId];
            if (worker && workerInfo.memoryUsage) {
                const memoryMB = workerInfo.memoryUsage.rss / 1024 / 1024;
                const uptime = Math.floor((Date.now() - workerInfo.startTime) / 1000);
                
                console.log(`[Worker-${workerInfo.id}] Memory: ${memoryMB.toFixed(1)}MB, Uptime: ${uptime}s`);
                
                // Restart worker if memory usage is too high
                if (memoryMB > MEMORY_LIMIT) {
                    console.log(`[Primary] Worker ${workerInfo.id} memory usage (${memoryMB.toFixed(1)}MB) exceeds limit (${MEMORY_LIMIT}MB). Restarting...`);
                    worker.kill();
                }
                
                // Restart worker if it's been running too long (prevent memory leaks)
                if (uptime > RESTART_INTERVAL / 1000) {
                    console.log(`[Primary] Worker ${workerInfo.id} uptime (${uptime}s) exceeds restart interval. Restarting...`);
                    worker.kill();
                }
            }
        });
    }, 30000); // Check every 30 seconds

    // Handle process termination
    process.on('SIGTERM', () => {
        console.log('[Primary] Received SIGTERM. Shutting down gracefully...');
        Object.values(cluster.workers).forEach(worker => {
            worker.kill();
        });
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('[Primary] Received SIGINT. Shutting down gracefully...');
        Object.values(cluster.workers).forEach(worker => {
            worker.kill();
        });
        process.exit(0);
    });

} else {
    // Worker process
    const workerId = process.env.WORKER_ID || 'unknown';
    const app = express();

    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "https://cdn.contentful.com"],
                connectSrc: ["'self'", "https://cdn.contentful.com", "https://www.google.com", "https://www.gstatic.com"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));

    // Compression middleware
    app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));

    // Cache control middleware
    app.use((req, res, next) => {
        // Cache static assets for 1 year
        if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Cache HTML for 1 hour
        else if (req.path === '/' || req.path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
        // No cache for API routes
        else if (req.path.startsWith('/api/')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        next();
    });

    // Serve static files from the React app build directory
    app.use(express.static(path.join(__dirname, 'build')));

    // Health check endpoint
    app.get('/health', (req, res) => {
        const memoryUsage = process.memoryUsage();
        res.json({
            status: 'healthy',
            worker: workerId,
            pid: process.pid,
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024)
            },
            uptime: Math.floor(process.uptime())
        });
    });

    // API routes can be added here
    app.get('/api/status', (req, res) => {
        res.json({
            message: 'Lightin\' Up Utah API is running',
            worker: workerId,
            timestamp: new Date().toISOString()
        });
    });

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(`[Worker-${workerId}] Error:`, err.stack);
        res.status(500).json({
            error: 'Something went wrong!',
            worker: workerId
        });
    });

    // Start server
    const server = app.listen(PORT, () => {
        console.log(`[Worker-${workerId}] Server running on port ${PORT} (PID: ${process.pid})`);
    });

    // Memory monitoring
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const memoryData = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            uptime: Math.floor(process.uptime())
        };
        
        console.log(`[Worker-${workerId}] Memory Usage:`, memoryData);
        
        // Send memory usage to master process
        if (process.send) {
            process.send({
                type: 'memory_usage',
                memory: memoryData
            });
        }
    }, 30000); // Report every 30 seconds

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log(`[Worker-${workerId}] Received SIGTERM. Shutting down gracefully...`);
        server.close(() => {
            console.log(`[Worker-${workerId}] Server closed`);
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log(`[Worker-${workerId}] Received SIGINT. Shutting down gracefully...`);
        server.close(() => {
            console.log(`[Worker-${workerId}] Server closed`);
            process.exit(0);
        });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error(`[Worker-${workerId}] Uncaught Exception:`, err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error(`[Worker-${workerId}] Unhandled Rejection at:`, promise, 'reason:', reason);
        process.exit(1);
    });
} 