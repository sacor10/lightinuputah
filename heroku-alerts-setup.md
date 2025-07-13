# 🚨 Heroku Performance Alerts Setup Guide

This guide will help you configure Heroku alerts for poor performance that will trigger emails to your primary Heroku email address.

## 📋 Prerequisites

- ✅ Papertrail addon installed: `papertrail-regular-92577`
- ✅ Enhanced monitoring system deployed
- ✅ Heroku CLI configured

## 🎯 Alert Configuration Steps

### Step 1: Access Papertrail Dashboard

The Papertrail dashboard should have opened automatically. If not, run:
```bash
heroku addons:open papertrail --app lightinuputah
```

### Step 2: Configure Performance Alerts

In the Papertrail dashboard, follow these steps:

#### 2.1 Create Web Vitals Alerts

**Alert 1: Poor LCP (Largest Contentful Paint)**
- **Search Query**: `[PERFORMANCE-ALERT] LCP is poor`
- **Alert Name**: "Poor LCP Performance"
- **Threshold**: 1 occurrence in 5 minutes
- **Email**: Your primary Heroku email

**Alert 2: Poor FCP (First Contentful Paint)**
- **Search Query**: `[PERFORMANCE-ALERT] FCP is poor`
- **Alert Name**: "Poor FCP Performance"
- **Threshold**: 1 occurrence in 5 minutes
- **Email**: Your primary Heroku email

**Alert 3: Poor CLS (Cumulative Layout Shift)**
- **Search Query**: `[PERFORMANCE-ALERT] CLS is poor`
- **Alert Name**: "Poor CLS Performance"
- **Threshold**: 1 occurrence in 5 minutes
- **Email**: Your primary Heroku email

**Alert 4: Poor FID (First Input Delay)**
- **Search Query**: `[PERFORMANCE-ALERT] FID is poor`
- **Alert Name**: "Poor FID Performance"
- **Threshold**: 1 occurrence in 5 minutes
- **Email**: Your primary Heroku email

#### 2.2 Create Error Alerts

**Alert 5: JavaScript Errors**
- **Search Query**: `JavaScript_Error`
- **Alert Name**: "JavaScript Errors Detected"
- **Threshold**: 3 occurrences in 10 minutes
- **Email**: Your primary Heroku email

**Alert 6: Unhandled Promise Rejections**
- **Search Query**: `unhandledrejection`
- **Alert Name**: "Unhandled Promise Rejections"
- **Threshold**: 1 occurrence in 5 minutes
- **Email**: Your primary Heroku email

#### 2.3 Create Resource Performance Alerts

**Alert 7: Slow Resource Loading**
- **Search Query**: `Resource_Load_Time` AND `"status":"poor"`
- **Alert Name**: "Slow Resource Loading"
- **Threshold**: 5 occurrences in 10 minutes
- **Email**: Your primary Heroku email

#### 2.4 Create Memory Alerts

**Alert 8: High Memory Usage**
- **Search Query**: `"usedJSHeapSize":8[0-9][0-9]` OR `"usedJSHeapSize":9[0-9][0-9]`
- **Alert Name**: "High Memory Usage"
- **Threshold**: 3 occurrences in 5 minutes
- **Email**: Your primary Heroku email

### Step 3: Advanced Alert Configuration

#### 3.1 Alert Frequency Settings
For each alert, configure:
- **Time Window**: 5-10 minutes (depending on severity)
- **Threshold**: 1-5 occurrences (depending on metric)
- **Cooldown**: 15-30 minutes (prevents spam)

#### 3.2 Email Configuration
- **Primary Email**: Your Heroku account email
- **Subject Line**: Customize with app name and metric
- **Include**: Log snippet and context

### Step 4: Test the Alerts

#### 4.1 Trigger Test Alerts
```bash
# Test performance alert
heroku logs --tail --app lightinuputah | grep "PERFORMANCE-ALERT"

# Test error alert
heroku logs --tail --app lightinuputah | grep "JavaScript_Error"
```

#### 4.2 Verify Email Delivery
- Check your primary Heroku email
- Verify alert content and formatting
- Test alert frequency and cooldown

## 🔧 Papertrail Dashboard Navigation

### Creating a New Alert
1. Go to **Alerts** tab in Papertrail
2. Click **"New Alert"**
3. Configure search query
4. Set threshold and time window
5. Add email notification
6. Save alert

### Alert Management
- **View Active Alerts**: Monitor current alert status
- **Alert History**: Review past triggered alerts
- **Edit Alerts**: Modify thresholds or queries
- **Delete Alerts**: Remove unnecessary alerts

## 📊 Alert Examples

### Example 1: LCP Performance Alert
```json
{
  "alert_name": "Poor LCP Performance",
  "search_query": "[PERFORMANCE-ALERT] LCP is poor",
  "threshold": "1 occurrence in 5 minutes",
  "email_subject": "🚨 Poor LCP Performance - Lightin Up Utah",
  "email_body": "LCP (Largest Contentful Paint) is performing poorly. Check immediately."
}
```

### Example 2: JavaScript Error Alert
```json
{
  "alert_name": "JavaScript Errors Detected",
  "search_query": "JavaScript_Error",
  "threshold": "3 occurrences in 10 minutes",
  "email_subject": "⚠️ JavaScript Errors - Lightin Up Utah",
  "email_body": "Multiple JavaScript errors detected. Review error logs."
}
```

## 🎯 Recommended Alert Thresholds

| Metric | Alert Threshold | Time Window | Cooldown |
|--------|----------------|-------------|----------|
| LCP > 4s | 1 occurrence | 5 minutes | 15 minutes |
| FCP > 3s | 1 occurrence | 5 minutes | 15 minutes |
| CLS > 0.25 | 1 occurrence | 5 minutes | 15 minutes |
| FID > 300ms | 1 occurrence | 5 minutes | 15 minutes |
| JavaScript Errors | 3 occurrences | 10 minutes | 30 minutes |
| Memory > 800MB | 3 occurrences | 5 minutes | 15 minutes |
| Slow Resources | 5 occurrences | 10 minutes | 20 minutes |

## 📧 Email Notification Setup

### Primary Email Configuration
1. **Email Address**: Your Heroku account email
2. **Subject Format**: `[ALERT] {Alert Name} - Lightin Up Utah`
3. **Include Context**: Log snippet, timestamp, app info
4. **Action Items**: Suggested next steps

### Email Content Template
```
Subject: 🚨 Poor LCP Performance - Lightin Up Utah

Alert: Poor LCP Performance
Time: {timestamp}
App: lightinuputah
Dyno: {dyno}

Log Entry:
{log_snippet}

Recommended Actions:
1. Check server response time
2. Optimize largest content element
3. Review image loading
4. Monitor for 15 minutes

View logs: heroku logs --tail --app lightinuputah
```

## 🔄 Alert Maintenance

### Weekly Review
- Check alert effectiveness
- Adjust thresholds if needed
- Review false positives
- Update email templates

### Monthly Optimization
- Analyze alert patterns
- Optimize search queries
- Update performance targets
- Review alert frequency

## 🚨 Emergency Contacts

### Primary Contact
- **Email**: Your Heroku account email
- **Response Time**: Immediate for critical alerts
- **Escalation**: After 30 minutes without response

### Backup Contact (Optional)
- **Email**: Secondary email address
- **Response Time**: 1 hour for non-critical alerts
- **Escalation**: After 2 hours without response

## 📞 Support

### Papertrail Support
- **Documentation**: `heroku addons:docs papertrail`
- **Support Email**: technicalsupport@solarwinds.com
- **Status Page**: https://status.papertrailapp.com

### Heroku Support
- **Documentation**: https://devcenter.heroku.com
- **Status Page**: https://status.heroku.com
- **Support**: Available in Heroku dashboard

## ✅ Verification Checklist

- [ ] Papertrail addon installed
- [ ] Dashboard accessible
- [ ] Alerts configured for all Web Vitals
- [ ] Error alerts set up
- [ ] Memory alerts configured
- [ ] Email notifications working
- [ ] Test alerts triggered
- [ ] Alert thresholds appropriate
- [ ] Cooldown periods set
- [ ] Emergency contacts configured

Your Heroku performance alerts are now configured to keep you informed of any performance issues! 🚀 