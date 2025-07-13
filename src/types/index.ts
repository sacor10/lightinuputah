// Gallery and Slideshow shared types
export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
}

// Alias for backward compatibility
export type SlideshowItem = GalleryItem;

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

// API response types
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Performance monitoring types
export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  imageCount: number;
  timestamp: number;
}

// Touch/swipe types
export interface TouchCoordinates {
  x: number;
  y: number;
}

// Component props types
export interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
} 