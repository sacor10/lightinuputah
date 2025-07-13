// Heroku Monitoring Service
// Provides structured logging and metrics for Heroku dashboard integration

interface HerokuMetrics {
  timestamp: string;
  type: 'performance' | 'error' | 'user-interaction' | 'resource-load';
  metric: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  context: {
    url: string;
    userAgent: string;
    connection: string;
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    heroku: {
      app: string;
      dyno: string;
      release: string;
    };
    resource?: {
      name: string;
      initiatorType: string;
      transferSize: number;
      encodedBodySize: number;
      decodedBodySize: number;
    };
    error?: {
      type: string;
      message: string;
      filename?: string;
      lineno?: number;
      colno?: number;
      stack?: string;
    };
    interaction?: {
      type: string;
      eventType: string;
    };
  };
}

class HerokuMonitoringService {
  private static instance: HerokuMonitoringService;
  private metricsBuffer: HerokuMetrics[] = [];
  private readonly bufferSize = 10;
  private readonly flushInterval = 30000; // 30 seconds

  private constructor() {
    this.setupPeriodicFlush();
    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupUserInteractionTracking();
  }

  public static getInstance(): HerokuMonitoringService {
    if (!HerokuMonitoringService.instance) {
      HerokuMonitoringService.instance = new HerokuMonitoringService();
    }
    return HerokuMonitoringService.instance;
  }

  private setupPeriodicFlush(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.logNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.logResourceMetrics(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandledrejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        reason: event.reason
      });
    });
  }

  private setupUserInteractionTracking(): void {
    let lastInteraction = Date.now();
    
    const trackInteraction = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      if (timeSinceLastInteraction > 5000) { // Only log if > 5 seconds
        this.logUserInteraction({
          type: 'user-activity',
          timeSinceLastInteraction,
          eventType: 'interaction'
        });
      }
      
      lastInteraction = now;
    };

    // Track various user interactions
    ['click', 'scroll', 'keypress', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });
  }

  private logNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        metric: 'DNS_Lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        unit: 'ms',
        status: this.getStatus(entry.domainLookupEnd - entry.domainLookupStart, 100, 300)
      },
      {
        metric: 'TCP_Connection',
        value: entry.connectEnd - entry.connectStart,
        unit: 'ms',
        status: this.getStatus(entry.connectEnd - entry.connectStart, 200, 600)
      },
      {
        metric: 'TTFB',
        value: entry.responseStart - entry.requestStart,
        unit: 'ms',
        status: this.getStatus(entry.responseStart - entry.requestStart, 800, 1800)
      },
      {
        metric: 'DOM_Content_Loaded',
        value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        unit: 'ms',
        status: this.getStatus(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart, 1000, 2000)
      },
      {
        metric: 'Load_Complete',
        value: entry.loadEventEnd - entry.loadEventStart,
        unit: 'ms',
        status: this.getStatus(entry.loadEventEnd - entry.loadEventStart, 2000, 4000)
      }
    ];

    metrics.forEach(metric => {
      this.logMetric({
        type: 'performance',
        ...metric,
        context: this.getContext()
      });
    });
  }

  private logResourceMetrics(entry: PerformanceResourceTiming): void {
    // Only log slow resources or errors
    const duration = entry.duration;
    const status = this.getStatus(duration, 1000, 3000);
    
    if (status !== 'good' || entry.transferSize === 0) {
      this.logMetric({
        type: 'resource-load',
        metric: 'Resource_Load_Time',
        value: duration,
        unit: 'ms',
        status,
        context: {
          ...this.getContext(),
          resource: {
            name: entry.name,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize
          }
        }
      });
    }
  }

  private logError(error: any): void {
    this.logMetric({
      type: 'error',
      metric: 'JavaScript_Error',
      value: 1,
      unit: 'count',
      status: 'poor',
      context: {
        ...this.getContext(),
        error: {
          type: error.type,
          message: error.message,
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno,
          stack: error.error?.stack
        }
      }
    });
  }

  private logUserInteraction(interaction: any): void {
    this.logMetric({
      type: 'user-interaction',
      metric: 'User_Activity',
      value: interaction.timeSinceLastInteraction,
      unit: 'ms',
      status: 'good',
      context: {
        ...this.getContext(),
        interaction: {
          type: interaction.type,
          eventType: interaction.eventType
        }
      }
    });
  }

  public logMetric(metric: Partial<HerokuMetrics>): void {
    const fullMetric: HerokuMetrics = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      metric: 'Unknown',
      value: 0,
      unit: 'ms',
      status: 'good',
      context: this.getContext(),
      ...metric
    };

    this.metricsBuffer.push(fullMetric);

    // Log immediately for important metrics
    if (fullMetric.status === 'poor' || fullMetric.type === 'error') {
      this.logToHeroku(fullMetric);
    }

    // Flush buffer if it's full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    // Log all buffered metrics
    this.metricsBuffer.forEach(metric => {
      this.logToHeroku(metric);
    });

    // Clear buffer
    this.metricsBuffer = [];
  }

  private logToHeroku(metric: HerokuMetrics): void {
    // Structured logging for Heroku
    console.log(`[HEROKU-METRIC] ${JSON.stringify(metric)}`);

    // Send to Heroku's logging system
    if (typeof window !== 'undefined' && (window as any).herokuLogs) {
      (window as any).herokuLogs.send(metric);
    }

    // Send to analytics if configured
    if (process.env.REACT_APP_ANALYTICS_ENABLED === 'true') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: HerokuMetrics): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'heroku_metric', {
        event_category: 'Heroku Monitoring',
        event_label: metric.metric,
        value: Math.round(metric.value),
        custom_parameter_1: metric.status,
        custom_parameter_2: metric.type
      });
    }
  }

  private getStatus(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }

  private getContext() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory ? {
        usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : undefined,
      heroku: {
        app: process.env.REACT_APP_HEROKU_APP_NAME || 'lightin-up-utah',
        dyno: process.env.DYNO || 'web.1',
        release: process.env.HEROKU_RELEASE_VERSION || 'unknown'
      }
    };
  }

  // Public method to manually log custom metrics
  public logCustomMetric(name: string, value: number, unit: string = 'ms', status: 'good' | 'needs-improvement' | 'poor' = 'good'): void {
    this.logMetric({
      type: 'performance',
      metric: name,
      value,
      unit,
      status
    });
  }

  // Get current memory usage
  public getMemoryUsage(): any {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}

export default HerokuMonitoringService; 