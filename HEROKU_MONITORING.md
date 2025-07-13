# 🚀 Heroku Monitoring & Performance Tracking

This guide explains how the enhanced monitoring system works and how to view performance metrics in your Heroku dashboard.

## 📊 Enhanced Monitoring Features

### Web Vitals Tracking
The application now tracks all Core Web Vitals with enhanced logging:

- **CLS** (Cumulative Layout Shift) - Visual stability
- **FID** (First Input Delay) - Interactivity  
- **FCP** (First Contentful Paint) - Loading performance
- **LCP** (Largest Contentful Paint) - Loading performance
- **TTFB** (Time to First Byte) - Server response time

### Additional Performance Metrics
- **Navigation Timing** - DNS lookup, TCP connection, DOM loading
- **Resource Loading** - Slow resource detection and tracking
- **Memory Usage** - JavaScript heap monitoring
- **Error Tracking** - JavaScript errors and unhandled rejections
- **User Interactions** - Activity patterns and engagement

## 🔧 How It Works

### 1. Enhanced Web Vitals (`reportWebVitals.ts`)
```typescript
// Performance thresholds for monitoring
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};
```

### 2. Heroku Monitoring Service (`herokuMonitoringService.ts`)
- **Structured Logging**: All metrics are logged in JSON format for easy parsing
- **Buffered Reporting**: Metrics are buffered and sent in batches to reduce overhead
- **Real-time Alerts**: Poor performance metrics trigger immediate alerts
- **Context Enrichment**: Each metric includes user agent, connection type, and Heroku dyno info

### 3. Integration Points
- **Heroku Logs**: All metrics appear in `heroku logs --tail`
- **Analytics**: Optional Google Analytics integration
- **Error Tracking**: Optional Sentry integration for poor metrics

## 📈 Viewing Metrics in Heroku

### 1. Real-time Logs
```bash
# View all performance metrics
heroku logs --tail | grep "WEB-VITAL\|HEROKU-METRIC"

# View only poor performance alerts
heroku logs --tail | grep "PERFORMANCE-ALERT"

# View error tracking
heroku logs --tail | grep "JavaScript_Error"
```

### 2. Log Examples

#### Web Vital Metric
```json
[WEB-VITAL] {
  "timestamp": "2025-01-15T10:30:45.123Z",
  "type": "web-vital",
  "metric": "LCP",
  "value": 2100,
  "unit": "ms",
  "status": "good",
  "url": "https://lightin-up-utah.herokuapp.com/",
  "userAgent": "Mozilla/5.0...",
  "connection": "4g",
  "heroku": {
    "app": "lightin-up-utah",
    "dyno": "web.1",
    "release": "v123"
  }
}
```

#### Performance Metric
```json
[HEROKU-METRIC] {
  "timestamp": "2025-01-15T10:30:45.123Z",
  "type": "performance",
  "metric": "TTFB",
  "value": 850,
  "unit": "ms",
  "status": "good",
  "context": {
    "url": "https://lightin-up-utah.herokuapp.com/",
    "userAgent": "Mozilla/5.0...",
    "connection": "4g",
    "memory": {
      "usedJSHeapSize": 45,
      "totalJSHeapSize": 80,
      "jsHeapSizeLimit": 2048
    },
    "heroku": {
      "app": "lightin-up-utah",
      "dyno": "web.1",
      "release": "v123"
    }
  }
}
```

#### Performance Alert
```
[PERFORMANCE-ALERT] LCP is poor: 4500ms
```

### 3. Heroku Dashboard Integration

#### Using Heroku CLI
```bash
# View app metrics
heroku ps

# Check dyno performance
heroku ps:scale

# Monitor memory usage
heroku logs --tail | grep "Memory:"
```

#### Using Heroku Dashboard
1. Go to your app in the Heroku dashboard
2. Navigate to the "Metrics" tab
3. View real-time performance data
4. Set up custom alerts for poor performance

### 4. Log Analysis Commands

#### Performance Summary
```bash
# Count good vs poor metrics
heroku logs --since 1h | grep "WEB-VITAL" | jq -r '.status' | sort | uniq -c

# Average LCP over last hour
heroku logs --since 1h | grep "LCP" | jq -r '.value' | awk '{sum+=$1; count++} END {print "Average LCP:", sum/count, "ms"}'

# Top slowest resources
heroku logs --since 1h | grep "Resource_Load_Time" | jq -r '.context.resource.name + ": " + (.value | tostring) + "ms"' | sort -k2 -nr | head -10
```

#### Error Analysis
```bash
# Count JavaScript errors
heroku logs --since 1h | grep "JavaScript_Error" | wc -l

# Most common errors
heroku logs --since 1h | grep "JavaScript_Error" | jq -r '.context.error.message' | sort | uniq -c | sort -nr
```

## 🎯 Performance Targets

### Web Vitals Targets
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |

### Navigation Timing Targets
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| DNS Lookup | ≤ 100ms | ≤ 300ms | > 300ms |
| TCP Connection | ≤ 200ms | ≤ 600ms | > 600ms |
| DOM Content Loaded | ≤ 1.0s | ≤ 2.0s | > 2.0s |
| Load Complete | ≤ 2.0s | ≤ 4.0s | > 4.0s |

## 🔧 Configuration

### Environment Variables
```bash
# Enable analytics integration
heroku config:set REACT_APP_ANALYTICS_ENABLED=true

# Set app name for monitoring
heroku config:set REACT_APP_HEROKU_APP_NAME=lightin-up-utah

# Enable detailed logging
heroku config:set REACT_APP_DEBUG_MONITORING=true
```

### Custom Metrics
You can log custom metrics from your components:

```typescript
import HerokuMonitoringService from './services/herokuMonitoringService';

// Log custom metric
HerokuMonitoringService.getInstance().logCustomMetric(
  'Gallery_Load_Time',
  1500,
  'ms',
  'good'
);
```

## 🚨 Alerts and Notifications

### Automatic Alerts
- **Poor Web Vitals**: Automatically logged when metrics exceed poor thresholds
- **JavaScript Errors**: All errors are captured and logged
- **Memory Issues**: High memory usage triggers warnings
- **Slow Resources**: Resources taking > 3 seconds are flagged

### Setting Up Notifications
```bash
# Set up Heroku alerts for poor performance
heroku addons:create papertrail:choklad

# Or use Heroku's built-in monitoring
heroku addons:create heroku-redis:hobby-dev
```

## 📊 Dashboard Integration

### Heroku Metrics Dashboard
The structured logging format allows you to:

1. **Parse logs** with tools like Papertrail or Logentries
2. **Create dashboards** in Grafana or similar tools
3. **Set up alerts** for poor performance
4. **Track trends** over time

### Example Dashboard Queries
```sql
-- Average LCP by hour
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(value) as avg_lcp
FROM web_vitals 
WHERE metric = 'LCP' 
GROUP BY hour 
ORDER BY hour;

-- Error rate by page
SELECT 
  url,
  COUNT(*) as error_count
FROM web_vitals 
WHERE type = 'error' 
GROUP BY url 
ORDER BY error_count DESC;
```

## 🔄 Continuous Monitoring

### Daily Checks
```bash
# Check performance trends
heroku logs --since 24h | grep "WEB-VITAL" | jq -r '.status' | sort | uniq -c

# Monitor error rates
heroku logs --since 24h | grep "JavaScript_Error" | wc -l
```

### Weekly Reports
```bash
# Generate performance report
heroku logs --since 7d | grep "WEB-VITAL" | jq -r '.metric + ": " + (.value | tostring) + "ms (" + .status + ")"' | sort | uniq -c
```

## 🎯 Optimization Opportunities

### Based on Metrics
1. **High TTFB**: Optimize server response time
2. **Slow LCP**: Optimize largest content element
3. **Poor CLS**: Fix layout shifts
4. **High FID**: Reduce JavaScript execution time
5. **Memory Leaks**: Monitor heap usage trends

### Action Items
- [ ] Set up automated alerts for poor performance
- [ ] Create performance dashboards
- [ ] Implement error tracking (Sentry)
- [ ] Add analytics integration (Google Analytics)
- [ ] Set up weekly performance reports

## 📞 Support

For monitoring issues:
1. Check logs: `heroku logs --tail`
2. Verify configuration: `heroku config`
3. Test metrics: Visit your app and check console logs
4. Review performance: Use browser DevTools Performance tab

Your enhanced monitoring system is now providing comprehensive performance insights for your Heroku deployment! 🚀 