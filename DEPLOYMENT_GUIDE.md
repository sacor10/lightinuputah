# 🚀 Deployment Guide for Lightin' Up Utah

This guide covers multiple deployment options for your clustered Node.js application.

## 📋 Pre-Deployment Checklist

- [x] React application built (`npm run build`)
- [x] All server files present (`server.js`, `server-enhanced.js`, `cluster-config.js`)
- [x] Environment variables configured
- [x] SSL certificates ready (for production)
- [x] Domain name configured (for production)

## 🎯 Deployment Options

### Option 1: Direct Node.js Deployment

#### Local/Development Server
```bash
# Build and start with clustering
npm run dev-enhanced

# Or use the deployment script
npm run deploy
```

#### Production Server
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run pm2-start

# Monitor the application
npm run pm2-monitor

# View logs
npm run pm2-logs
```

### Option 2: Docker Deployment

#### Build and Run Docker Container
```bash
# Build the Docker image
npm run docker-build

# Run the container
npm run docker-run

# Or use Docker Compose (recommended)
npm run docker-compose-up
```

#### Docker Compose with Nginx
```bash
# Start all services (app + nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server-enhanced.js" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
WORKERS=4
MEMORY_THRESHOLD=400
MAX_MEMORY_PER_WORKER=512
ENABLE_COMPRESSION=true
ENABLE_MONITORING=true
MONITORING_INTERVAL=30000
```

### Platform-Specific Configuration

#### Heroku
```bash
heroku config:set NODE_ENV=production
heroku config:set WORKERS=4
heroku config:set MEMORY_THRESHOLD=400
```

#### Docker
```bash
# Set in docker-compose.yml or use .env file
docker run -e NODE_ENV=production -e WORKERS=4 lightin-up-utah
```

## 🔒 SSL Configuration

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Monitor memory usage
npm run pm2-monitor

# View application logs
npm run pm2-logs
```

### Performance Monitoring
```bash
# Monitor cluster performance
pm2 monit

# View detailed metrics
pm2 show lightin-up-utah

# Restart application
pm2 restart lightin-up-utah
```

### Log Management
```bash
# View real-time logs
tail -f logs/combined.log

# Rotate logs (if using logrotate)
sudo logrotate /etc/logrotate.d/lightin-up-utah
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Restart with more memory
NODE_OPTIONS="--max-old-space-size=1024" npm run pm2-start
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x deploy.js
chmod 755 logs/

# Fix ownership
sudo chown -R $USER:$USER .
```

### Performance Optimization

#### Adjust Worker Count
```bash
# For high-traffic sites
WORKERS=8 npm run pm2-start

# For low-resource servers
WORKERS=2 npm run pm2-start
```

#### Memory Optimization
```bash
# Increase memory threshold
MEMORY_THRESHOLD=600 npm run pm2-start

# Enable garbage collection
NODE_OPTIONS="--expose-gc" npm run pm2-start
```

## 🔄 Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz build/ logs/ package*.json
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, haproxy)
- Deploy multiple instances
- Use container orchestration (Kubernetes, Docker Swarm)

### Vertical Scaling
- Increase server resources
- Optimize Node.js memory settings
- Use SSD storage for better I/O

### Database Considerations
- Use connection pooling
- Implement caching (Redis)
- Optimize queries

## 🎯 Next Steps

1. **Choose deployment method** based on your infrastructure
2. **Configure environment variables** for your production environment
3. **Set up SSL certificates** for HTTPS
4. **Configure monitoring** and alerting
5. **Test the deployment** thoroughly
6. **Set up backups** and disaster recovery
7. **Monitor performance** and optimize as needed

## 📞 Support

For deployment issues:
1. Check the logs: `npm run pm2-logs`
2. Monitor memory usage: `npm run pm2-monitor`
3. Verify configuration: `node -e "console.log(require('./cluster-config'))"`
4. Test health endpoint: `curl http://localhost:3000/health`

Your clustered application is now ready for production deployment! 🚀 