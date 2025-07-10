# Node.js Clustering for Memory Optimization

This project implements Node.js clustering to serve your React application with enhanced memory management and performance optimization.

## 🚀 Benefits of Clustering

### Memory Optimization
- **Memory Isolation**: Each worker process has its own memory space
- **Automatic Cleanup**: Memory leaks in one worker don't affect others
- **Memory Monitoring**: Real-time tracking of memory usage per worker
- **Automatic Restart**: Workers restart when memory usage exceeds thresholds

### Performance Benefits
- **Load Distribution**: Multiple workers handle concurrent requests
- **CPU Utilization**: Better use of multi-core systems
- **Fault Tolerance**: Automatic worker restart on crashes
- **Compression**: Built-in gzip/deflate compression for static assets

## 📁 Files Overview

- `server.js` - Basic clustered server
- `server-enhanced.js` - Advanced server with memory management
- `cluster-config.js` - Configuration for all cluster settings
- `package.json` - Updated with new scripts

## 🛠️ Usage

### Development
```bash
# Build and serve with clustering
npm run dev

# Or build first, then serve
npm run build
npm run serve
```

### Production
```bash
# Production build with clustering
npm run prod
```

### Environment Variables

You can customize the clustering behavior with these environment variables:

```bash
# Number of workers (defaults to CPU cores)
WORKERS=4

# Memory threshold per worker in MB
MEMORY_THRESHOLD=400

# Maximum memory per worker in MB
MAX_MEMORY_PER_WORKER=512

# Monitoring interval in milliseconds
MONITORING_INTERVAL=30000

# Enable/disable compression
ENABLE_COMPRESSION=true

# Enable/disable monitoring
ENABLE_MONITORING=true

# Port for the server
PORT=3000
```

## 📊 Memory Management Features

### Automatic Memory Monitoring
- Tracks RSS, heap total, heap used, and external memory
- Logs memory usage every 30 seconds (configurable)
- Warns when memory usage exceeds thresholds

### Memory Pressure Handling
- Automatically restarts workers when memory usage is high
- Performs garbage collection when available
- Limits restart attempts to prevent infinite loops

### Graceful Shutdown
- Handles SIGTERM signals properly
- Closes server connections gracefully
- Prevents memory leaks during shutdown

## 🔧 Configuration Options

### Cluster Settings
```javascript
cluster: {
  workers: 4,                    // Number of worker processes
  maxMemoryPerWorker: 512,       // Max memory per worker (MB)
  memoryThreshold: 400,          // Memory threshold for restart (MB)
  restartInterval: 60            // Restart interval (minutes)
}
```

### Server Settings
```javascript
server: {
  port: 3000,                    // Server port
  staticPath: './build',         // Static files directory
  enableCompression: true,       // Enable gzip compression
  cacheControl: {
    static: 'public, max-age=31536000',  // Cache static assets
    html: 'public, max-age=0, no-cache'  // No cache for HTML
  }
}
```

## 📈 Performance Monitoring

The enhanced server includes comprehensive monitoring:

```bash
# Example output
🚀 Primary 1234 is running
📊 Starting 4 workers for optimal performance
⚙️  Configuration: { workers: 4, maxMemoryPerWorker: '512MB', memoryThreshold: '400MB', port: 3000 }
✅ Worker 5678 is online
✅ Worker 5679 is online
✅ Worker 5680 is online
✅ Worker 5681 is online

[Worker-1] Memory Usage: { rss: 45, heapTotal: 20, heapUsed: 15, external: 2, uptime: 30 }
[Worker-2] Memory Usage: { rss: 42, heapTotal: 18, heapUsed: 14, external: 2, uptime: 30 }
```

## 🚨 Memory Optimization Strategies

### 1. Worker Isolation
- Each worker runs in its own process
- Memory leaks are contained within individual workers
- Automatic restart prevents memory accumulation

### 2. Garbage Collection
- Automatic GC when memory pressure is detected
- Manual GC available with `--expose-gc` flag
- Memory cleanup on worker restart

### 3. Resource Management
- Proper connection handling
- Timeout configurations
- Graceful error handling

## 🔍 Troubleshooting

### High Memory Usage
1. Check memory logs for specific workers
2. Adjust `MEMORY_THRESHOLD` if needed
3. Monitor for memory leaks in application code

### Worker Crashes
1. Check error logs for specific issues
2. Verify file permissions for build directory
3. Ensure all dependencies are installed

### Performance Issues
1. Adjust number of workers based on CPU cores
2. Enable compression for better bandwidth usage
3. Monitor server response times

## 📚 Additional Resources

- [Node.js Cluster Documentation](https://nodejs.org/api/cluster.html)
- [Memory Management Best Practices](https://nodejs.org/en/docs/guides/memory-management/)
- [Performance Optimization Guide](https://nodejs.org/en/docs/guides/performance/)

## 🎯 Next Steps

1. **Build your React app**: `npm run build`
2. **Start the clustered server**: `npm run serve`
3. **Monitor memory usage** in the console
4. **Adjust configuration** based on your needs
5. **Deploy to production** with proper environment variables

The clustering setup will automatically handle memory optimization, load balancing, and fault tolerance for your React application! 