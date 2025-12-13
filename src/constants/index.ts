// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
} as const;

// Gallery configuration
export const GALLERY_CONFIG = {
  INITIAL_ITEMS_MOBILE: 3,
  INITIAL_ITEMS_DESKTOP: 6,
  LOAD_MORE_INCREMENT: 6,
  MIN_COLUMN_WIDTH: 250,
  DESKTOP_COLUMN_WIDTH: 300,
  MOBILE_PADDING: 32,
  DESKTOP_PADDING: 64,
} as const;

// Slideshow configuration
export const SLIDESHOW_CONFIG = {
  AUTO_ADVANCE_INTERVAL: 5000,
  TRANSITION_DURATION: 300,
  MIN_SWIPE_DISTANCE: 50,
  MAX_ITEMS: 10,
} as const;

// Form validation
export const FORM_VALIDATION = {
  NAME_MIN_LENGTH: 5,
  NAME_MAX_LENGTH: 50,
  MESSAGE_MIN_LENGTH: 10,
  MESSAGE_MAX_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{10}$/, // Exactly 10 digits (area code + 7 digits)
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CONTACT: '/.netlify/functions/contact',
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

// Image optimization
export const IMAGE_CONFIG = {
  RESPONSIVE_WIDTHS: [400, 800, 1200, 1600],
  QUALITY: 80,
  LAZY_LOAD_MARGIN: '50px 0px',
  INTERSECTION_THRESHOLD: 0.1,
} as const;

// Touch/swipe configuration
export const TOUCH_CONFIG = {
  BACK_GESTURE_THRESHOLD: 30,
  MIN_SWIPE_DISTANCE: 20,
} as const; 