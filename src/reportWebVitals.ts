import { ReportHandler } from 'web-vitals';

// Performance thresholds for monitoring
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FID: { good: 100, needsImprovement: 300 },  // First Input Delay (ms)
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte (ms)
};

// Enhanced logging function for Heroku
const logToHeroku = (metric: any) => {
  const timestamp = new Date().toISOString();
  const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
  
  let performanceStatus = 'good';
  if (threshold) {
    if (metric.value > threshold.needsImprovement) {
      performanceStatus = 'poor';
    } else if (metric.value > threshold.good) {
      performanceStatus = 'needs-improvement';
    }
  }

  // Structured logging for Heroku
  const logData = {
    timestamp,
    type: 'web-vital',
    metric: metric.name,
    value: metric.value,
    unit: metric.unit || 'ms',
    status: performanceStatus,
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    // Additional context for Heroku monitoring
    heroku: {
      app: process.env.REACT_APP_HEROKU_APP_NAME || 'lightin-up-utah',
      dyno: process.env.DYNO || 'web.1',
      release: process.env.HEROKU_RELEASE_VERSION || 'unknown'
    }
  };

  // Log to console with structured format for Heroku logs
  console.log(`[WEB-VITAL] ${JSON.stringify(logData)}`);

  // Send to analytics if configured
  if (process.env.REACT_APP_ANALYTICS_ENABLED === 'true') {
    // You can integrate with Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vital', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_parameter_1: performanceStatus
      });
    }
  }

  // Performance alerts for poor metrics
  if (performanceStatus === 'poor') {
    console.warn(`[PERFORMANCE-ALERT] ${metric.name} is poor: ${metric.value}${metric.unit || 'ms'}`);
    
    // Could send to error tracking service like Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
        level: 'warning',
        tags: {
          metric: metric.name,
          value: metric.value,
          status: performanceStatus
        }
      });
    }
  }
};

// Enhanced performance monitoring
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Enhanced metric collection with additional context
      const enhancedOnPerfEntry = (metric: any) => {
        // Add additional context to the metric
        const enhancedMetric = {
          ...metric,
          timestamp: Date.now(),
          pageLoadTime: performance.now(),
          navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'unknown',
          // Add memory info if available
          memory: (performance as any).memory ? {
            usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
            jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
          } : null
        };

        // Log to Heroku
        logToHeroku(enhancedMetric);
        
        // Call the original callback
        onPerfEntry(metric);
      };

      getCLS(enhancedOnPerfEntry);
      getFID(enhancedOnPerfEntry);
      getFCP(enhancedOnPerfEntry);
      getLCP(enhancedOnPerfEntry);
      getTTFB(enhancedOnPerfEntry);
    });
  } else {
    // Default logging when no callback provided
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(logToHeroku);
      getFID(logToHeroku);
      getFCP(logToHeroku);
      getLCP(logToHeroku);
      getTTFB(logToHeroku);
    });
  }
};

export default reportWebVitals;
