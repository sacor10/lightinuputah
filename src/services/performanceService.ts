interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  imageCount: number;
  cacheHitRate: number;
}

class PerformanceService {
  private static instance: PerformanceService;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    bundleSize: 0,
    imageCount: 0,
    cacheHitRate: 0
  };

  private constructor() {
    this.initializePerformanceMonitoring();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Cache management
  public setCache<T>(key: string, data: T, ttl = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  // Request deduplication
  public async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Check cache first
    const cached = this.getCache<T>(key);
    if (cached) {
      this.updateCacheHitRate(true);
      return cached;
    }

    // Create new request
    const request = requestFn().then(result => {
      this.setCache(key, result);
      this.pendingRequests.delete(key);
      this.updateCacheHitRate(false);
      return result;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Performance monitoring
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        }
      });

      // Monitor bundle size
      const scripts = document.querySelectorAll('script[src]');
      this.metrics.bundleSize = Array.from(scripts).reduce((total, script) => {
        const src = script.getAttribute('src');
        if (src && src.includes('static/js/')) {
          // Estimate size based on script loading
          return total + 1; // Simplified for demo
        }
        return total;
      }, 0);

      // Monitor image count
      this.metrics.imageCount = document.querySelectorAll('img').length;
    }
  }

  private updateCacheHitRate(hit: boolean): void {
    // Simple cache hit rate calculation
    const totalRequests = this.metrics.cacheHitRate + 1;
    this.metrics.cacheHitRate = hit ? 
      (this.metrics.cacheHitRate + 1) / totalRequests : 
      this.metrics.cacheHitRate / totalRequests;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Image optimization helpers
  public generateImageUrl(imageUrl: string, width: number, quality = 80): string {
    if (!imageUrl) return '';
    
    const baseUrl = imageUrl.split('?')[0];
    const params = imageUrl.includes('?') ? imageUrl.split('?')[1] : '';
    
    return `${baseUrl}?w=${width}&q=${quality}&${params}`;
  }

  public preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  }

  public preloadCriticalImages(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  // Bundle analysis
  public async analyzeBundle(): Promise<{ size: number; chunks: any[] }> {
    if (typeof window === 'undefined') {
      return { size: 0, chunks: [] };
    }

    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    const totalSize = jsResources.reduce((sum, resource) => {
      const perfResource = resource as PerformanceResourceTiming;
      return sum + (perfResource.transferSize || 0);
    }, 0);

    return {
      size: totalSize,
      chunks: jsResources.map(r => {
        const perfResource = r as PerformanceResourceTiming;
        return {
          name: r.name,
          size: perfResource.transferSize || 0,
          duration: r.duration
        };
      })
    };
  }

  // Memory management
  public cleanup(): void {
    // Clear expired cache entries
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Clear pending requests older than 30 seconds
    this.pendingRequests.clear();
  }
}

export default PerformanceService; 