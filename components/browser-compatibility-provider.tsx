'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { browserFeatures, fallbacks, applyBrowserFixes } from '@/lib/browser-compatibility';

type BrowserFeatureState = {
  webpSupported: boolean;
  intersectionObserverSupported: boolean;
  resizeObserverSupported: boolean;
  localStorageSupported: boolean;
  touchSupported: boolean;
  cssGridSupported: boolean;
};

type BrowserCompatibilityContextType = {
  features: BrowserFeatureState;
  fallbackStorage: typeof fallbacks.localStorage;
};

const initialFeatures: BrowserFeatureState = {
  webpSupported: false,
  intersectionObserverSupported: false,
  resizeObserverSupported: false,
  localStorageSupported: false,
  touchSupported: false,
  cssGridSupported: false,
};

const BrowserCompatibilityContext = createContext<BrowserCompatibilityContextType>({
  features: initialFeatures,
  fallbackStorage: fallbacks.localStorage,
});

export function BrowserCompatibilityProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<BrowserFeatureState>(initialFeatures);

  useEffect(() => {
    // Run on client-side only
    if (typeof window === 'undefined') return;

    // Apply browser-specific fixes
    applyBrowserFixes();

    // Import CSS reset to normalize styles across browsers
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/styles/reset.css';
    document.head.appendChild(linkElement);
    
    // Detect browser features
    const detectFeatures = async () => {
      const webpSupported = await browserFeatures.checkWebpSupport();
      
      setFeatures({
        webpSupported,
        intersectionObserverSupported: browserFeatures.hasIntersectionObserver,
        resizeObserverSupported: browserFeatures.hasResizeObserver,
        localStorageSupported: browserFeatures.hasLocalStorage(),
        touchSupported: browserFeatures.hasTouchSupport(),
        cssGridSupported: browserFeatures.supportsCSSGrid(),
      });
    };

    detectFeatures();
  }, []);

  const contextValue = {
    features,
    fallbackStorage: features.localStorageSupported ? window.localStorage : fallbacks.localStorage,
  };

  return (
    <BrowserCompatibilityContext.Provider value={contextValue}>
      {children}
    </BrowserCompatibilityContext.Provider>
  );
}

export function useBrowserCompatibility() {
  return useContext(BrowserCompatibilityContext);
}
