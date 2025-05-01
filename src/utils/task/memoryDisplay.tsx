import React, { useState, useEffect } from 'react';
import { getMemoryStats } from './memoryStats';

interface MemoryDisplayProps {
  refreshInterval?: number;
  showDetails?: boolean;
}

/**
 * Component for displaying memory usage statistics in development mode
 */
export const MemoryDisplay: React.FC<MemoryDisplayProps> = ({ 
  refreshInterval = 5000,
  showDetails = false
}) => {
  const [stats, setStats] = useState(getMemoryStats());
  const [visible, setVisible] = useState(true);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStats(getMemoryStats());
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!visible) {
    return (
      <button 
        className="fixed bottom-2 right-2 bg-blue-500 text-white p-2 rounded shadow-md z-50"
        onClick={() => setVisible(true)}
      >
        Show Memory Stats
      </button>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 bg-white border border-gray-200 p-4 rounded shadow-md z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Memory Usage</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setVisible(false)}
        >
          Hide
        </button>
      </div>
      
      <div className="text-xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="font-medium">Active Listeners:</div>
          <div className="text-right">{stats.activeListeners}</div>
          
          <div className="font-medium">Active Subscriptions:</div>
          <div className="text-right">{stats.activeSubscriptions}</div>
          
          <div className="font-medium">Events Emitted:</div>
          <div className="text-right">{stats.totalEmissions}</div>
          
          <div className="font-medium">Events Handled:</div>
          <div className="text-right">{stats.totalHandledEvents}</div>
          
          <div className="font-medium">Memory Usage:</div>
          <div className="text-right">{formatBytes(stats.peakMemoryUsage)}</div>
          
          <div className="font-medium">Cache Size:</div>
          <div className="text-right">{stats.cacheSize} items</div>
        </div>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="font-medium mb-1">Details:</div>
            <pre className="text-xs bg-gray-100 p-1 rounded">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};