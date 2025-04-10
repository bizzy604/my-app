'use client';

import { useEffect, useCallback } from 'react';

// This component exists only on the client and handles document downloads
export function DocumentDownloader({ url, fileName, isTriggered, onComplete }: { 
  url: string; 
  fileName: string; 
  isTriggered: boolean;
  onComplete: () => void;
}) {
  const downloadFile = useCallback(() => {
    try {
      // Create an invisible anchor and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onComplete();
    } catch (error) {
      console.error('Error downloading document:', error);
      onComplete();
    }
  }, [url, fileName, onComplete]);

  useEffect(() => {
    if (isTriggered) {
      downloadFile();
    }
  }, [isTriggered, downloadFile]);

  // This component doesn't render anything
  return null;
}
