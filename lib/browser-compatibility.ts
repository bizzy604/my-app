/**
 * Browser compatibility utilities for InnovBid
 */

// Feature detection for modern browser features
export const browserFeatures = {
  // Check for WebP support
  checkWebpSupport: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const webpImage = new Image();
    const checkPromise = new Promise<boolean>((resolve) => {
      webpImage.onload = () => resolve(webpImage.width === 1);
      webpImage.onerror = () => resolve(false);
    });
    
    webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    return checkPromise;
  },
  
  // Check for Intersection Observer API support
  hasIntersectionObserver: typeof IntersectionObserver !== 'undefined',
  
  // Check for ResizeObserver API support
  hasResizeObserver: typeof ResizeObserver !== 'undefined',
  
  // Check for localStorage support
  hasLocalStorage: () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      const result = localStorage.getItem(testKey) === testKey;
      localStorage.removeItem(testKey);
      return result;
    } catch (e) {
      return false;
    }
  },
  
  // Detect touch support
  hasTouchSupport: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Check for CSS Grid support
  supportsCSSGrid: () => {
    if (typeof window === 'undefined') return false;
    return window.CSS && CSS.supports && CSS.supports('display', 'grid');
  }
};

// Fallback implementations for missing browser features
export const fallbacks = {
  // LocalStorage fallback using memory storage
  localStorage: (() => {
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); }
    };
  })(),
  
  // Simple polyfill for smooth scrolling if native isn't supported
  smoothScroll: (element: HTMLElement, options: ScrollToOptions = {}) => {
    const start = window.pageYOffset;
    const target = element.getBoundingClientRect().top + start;
    const duration = options.behavior === 'smooth' ? 500 : 0;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    
    const scroll = () => {
      const currentTime = 'now' in window.performance ? performance.now() : new Date().getTime();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutCubic = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, start + (target * easeInOutCubic));
      
      if (elapsed < duration) {
        requestAnimationFrame(scroll);
      }
    };
    
    if (duration === 0) {
      window.scrollTo(0, target);
    } else {
      requestAnimationFrame(scroll);
    }
  }
};

// Browser detection (to be used sparingly, only for extreme edge cases)
export const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
    return 'ie';
  } else if (userAgent.indexOf('edge') !== -1 || userAgent.indexOf('edg/') !== -1) {
    return 'edge';
  } else if (userAgent.indexOf('firefox') !== -1) {
    return 'firefox';
  } else if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  } else if (userAgent.indexOf('chrome') !== -1) {
    return 'chrome';
  } else {
    return 'unknown';
  }
};

// Apply browser-specific fixes
export const applyBrowserFixes = () => {
  const browser = detectBrowser();
  
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Fix for Safari's flexbox gap issues
  if (browser === 'safari') {
    document.documentElement.classList.add('safari');
  }
  
  // Fix for IE's lack of support for CSS variables
  if (browser === 'ie') {
    document.documentElement.classList.add('ie');
  }
};
