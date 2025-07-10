# 🚀 Heroku Setup Guide

This guide walks you through setting up your clustered Node.js application on Heroku.

## 📋 Prerequisites

- Heroku CLI installed
- Heroku account
- GitHub repository connected to Heroku

## 🎯 Step-by-Step Setup

### Step 1: Install Heroku CLI (if not already installed)
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App (if not already created)
```bash
heroku create your-app-name
```

### Step 4: Set Environment Variables

Run these commands in your terminal:

```bash
# Basic configuration
heroku config:set NODE_ENV=production

# Cluster configuration (optimized for Heroku)
heroku config:set WORKERS=2
heroku config:set MEMORY_THRESHOLD=200
heroku config:set MAX_MEMORY_PER_WORKER=256

# Performance settings
heroku config:set ENABLE_COMPRESSION=true
heroku config:set ENABLE_MONITORING=true
heroku config:set MONITORING_INTERVAL=60000

# Connection settings
heroku config:set MAX_CONNECTIONS=500

# Optional: Custom domain (if you have one)
heroku config:set DOMAIN=your-domain.com
```

### Step 5: Verify Configuration
```bash
# View all environment variables
heroku config

# Expected output should include:
# NODE_ENV: production
# WORKERS: 2
# MEMORY_THRESHOLD: 200
# MAX_MEMORY_PER_WORKER: 256
# ENABLE_COMPRESSION: true
# ENABLE_MONITORING: true
# MONITORING_INTERVAL: 60000
# MAX_CONNECTIONS: 500
```

### Step 6: Deploy to Heroku

Since you have automatic deployments from GitHub:

1. **Push your changes to GitHub:**
```bash
git add .
git commit -m "Add Heroku clustering support"
git push origin main
```

2. **Heroku will automatically deploy** when it detects the push

3. **Monitor the deployment:**
```bash
heroku logs --tail
```

### Step 7: Verify Deployment

```bash
# Check app status
heroku ps

# View recent logs
heroku logs --tail

# Open the app
heroku open

# Test health endpoint
curl https://your-app-name.herokuapp.com/health
```

## 🔧 Configuration Details

### Memory Optimization for Heroku

Heroku has memory constraints, so we've optimized the settings:

- **Workers**: 2 (instead of 4) to stay within memory limits
- **Memory Threshold**: 200MB (lower than production)
- **Max Memory Per Worker**: 256MB
- **Monitoring Interval**: 60 seconds (less frequent to reduce overhead)

### Heroku-Specific Features

- **Request ID Tracking**: Automatically adds `X-Request-ID` headers
- **Health Check Endpoint**: Available at `/health`
- **Heroku Logging**: Uses Heroku's logging system
- **Graceful Shutdown**: Handles Heroku's SIGTERM signals

## 📊 Monitoring Your App

### View Logs
```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs -n 200

# Logs for specific time
heroku logs --since 1h
```

### Monitor Performance
```bash
# Check dyno status
heroku ps

# View dyno metrics
heroku ps:scale

# Monitor memory usage
heroku logs --tail | grep "Memory:"
```

### Health Checks
```bash
# Test health endpoint
curl https://your-app-name.herokuapp.com/health

# Expected response:
{
  "status": "healthy",
  "worker": 1,
  "pid": 12345,
  "uptime": 3600,
  "memory": {...},
  "requestId": "req-1234567890-abc123"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
heroku logs --tail

# Common fixes:
# 1. Ensure all dependencies are in package.json
# 2. Check that Procfile exists and is correct
# 3. Verify Node.js version compatibility
```

#### Memory Issues
```bash
# Check memory usage
heroku logs | grep "Memory:"

# If memory is too high, reduce workers:
heroku config:set WORKERS=1
heroku restart
```

#### App Not Starting
```bash
# Check if app is running
heroku ps

# Restart the app
heroku restart

# Check for errors
heroku logs --tail
```

### Performance Optimization

#### Scale Your App
```bash
# Scale to more dynos (if needed)
heroku ps:scale web=2

# Scale to different dyno types
heroku ps:type standard-1x
```

#### Optimize Memory Usage
```bash
# Reduce memory threshold
heroku config:set MEMORY_THRESHOLD=150

# Disable monitoring if not needed
heroku config:set ENABLE_MONITORING=false
```

## 🔄 Continuous Deployment

### GitHub Integration

1. **Connect GitHub repository** in Heroku dashboard
2. **Enable automatic deploys** from main branch
3. **Enable review apps** for pull requests (optional)

### Manual Deployment
```bash
# Deploy manually
git push heroku main

# Or deploy specific branch
git push heroku your-branch:main
```

## 📈 Scaling Considerations

### Free Tier Limitations
- **Sleep after 30 minutes** of inactivity
- **Limited memory** (512MB total)
- **No custom domains** on free tier

### Paid Tier Benefits
- **Always-on dynos**
- **More memory** available
- **Custom domains** with SSL
- **Better performance**

## 🎯 Next Steps

1. **Test your deployment** thoroughly
2. **Monitor performance** and memory usage
3. **Set up custom domain** (if needed)
4. **Configure SSL** (automatic on paid tiers)
5. **Set up monitoring** and alerting

## 📞 Support

For Heroku-specific issues:
1. Check Heroku logs: `heroku logs --tail`
2. Verify configuration: `heroku config`
3. Test health endpoint: `curl https://your-app.herokuapp.com/health`
4. Check Heroku status: https://status.heroku.com

Your clustered application is now optimized for Heroku! 🚀 