// Performance thresholds for monitoring
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FID: { good: 100, needsImprovement: 300 },  // First Input Delay (ms)
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte (ms)
};

// Generic logging function for web vitals
const logWebVital = (metric: any) => {
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
  };

  // Log to console
  console.log(`[WEB-VITAL] ${JSON.stringify(logData)}`);
};

// Enhanced performance monitoring
const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const enhancedOnPerfEntry = (metric: any) => {
        const enhancedMetric = {
          ...metric,
          timestamp: Date.now(),
          pageLoadTime: performance.now(),
          navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'unknown',
          memory: (performance as any).memory ? {
            usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
            jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
          } : null
        };
        logWebVital(enhancedMetric);
        onPerfEntry(metric);
      };
      getCLS(enhancedOnPerfEntry);
      getFID(enhancedOnPerfEntry);
      getFCP(enhancedOnPerfEntry);
      getLCP(enhancedOnPerfEntry);
      getTTFB(enhancedOnPerfEntry);
    });
  } else {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(logWebVital);
      getFID(logWebVital);
      getFCP(logWebVital);
      getLCP(logWebVital);
      getTTFB(logWebVital);
    });
  }
};

export default reportWebVitals;
