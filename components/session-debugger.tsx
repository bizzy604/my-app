'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SessionDebugger() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  // Function to refresh the user's session token with latest DB data
  const handleForceRefreshToken = async () => {
    setLoading(true);
    try {
      // Use our special refresh-session endpoint
      window.location.href = '/api/refresh-session';
    } catch (error) {
      console.error('Error refreshing token:', error);
      setLoading(false);
    }
  };

  // Function to view token data for debugging
  const handleViewTokenData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/token');
      const data = await response.json();
      setResult(data);
      setShowDetails(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching token data:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={handleForceRefreshToken}
          size="sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Force Refresh Session Token
        </Button>
        
        <Button
          onClick={handleViewTokenData}
          size="sm"
          variant="outline"
          disabled={loading}
        >
          View Token Data
        </Button>
      </div>

      {showDetails && result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs">
          <h3 className="font-semibold mb-2">Token Data:</h3>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(result.token, null, 2)}
          </pre>
          
          <h3 className="font-semibold mt-4 mb-2">Database Data:</h3>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(result.database, null, 2)}
          </pre>
          
          <Button
            onClick={() => setShowDetails(false)}
            size="sm"
            variant="ghost"
            className="mt-4"
          >
            Hide Details
          </Button>
        </div>
      )}
    </div>
  );
}
