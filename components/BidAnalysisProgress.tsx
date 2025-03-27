'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressData {
  status: string;
  progress: number;
  message: string;
  timestamp: string;
}

interface BidAnalysisProgressProps {
  bidId: string;
  onComplete?: () => void;
}

export function BidAnalysisProgress({ bidId, onComplete }: BidAnalysisProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/ai-progress?bidId=${bidId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        const data = await response.json();
        setProgressData(data);
        
        if (data.status === 'COMPLETED') {
          onComplete?.();
        } else if (data.status === 'FAILED') {
          setError(data.message);
        }
      } catch (error) {
        console.error('Error checking progress:', error);
        setError(error instanceof Error ? error.message : 'Failed to check progress');
      }
    };

    const interval = setInterval(checkProgress, 2000);
    return () => clearInterval(interval);
  }, [bidId, onComplete]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!progressData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {progressData.status}: {progressData.message}
        </span>
        <span className="text-sm font-medium">
          {Math.round(progressData.progress)}%
        </span>
      </div>
      <Progress value={progressData.progress} className="w-full" />
    </div>
  );
}
