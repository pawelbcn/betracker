"use client";
import { useState, useEffect } from 'react';
import { getCacheStats, clearExpiredCache, clearAllCache } from '@/logic/exchangeRates';
import { Trash2, RefreshCw, Database } from 'lucide-react';

interface CacheStatsProps {
  className?: string;
}

export default function CacheStats({ className = "" }: CacheStatsProps) {
  const [stats, setStats] = useState<{
    size: number;
    entries: Array<{ key: string; rate: number; date: string; cachedAt: number; age: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStats = () => {
    setLoading(true);
    try {
      const newStats = getCacheStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearExpired = () => {
    try {
      const cleared = clearExpiredCache();
      console.log(`Cleared ${cleared} expired entries`);
      refreshStats();
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  };

  const handleClearAll = () => {
    try {
      clearAllCache();
      console.log('Cleared all cache entries');
      refreshStats();
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  if (!stats) {
    return (
      <div className={`p-4 bg-neutral-50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-neutral-600">
          <Database className="w-4 h-4" />
          <span>Loading cache stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-neutral-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="font-medium text-neutral-900">Exchange Rate Cache</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshStats}
            disabled={loading}
            className="p-1 text-neutral-600 hover:text-blue-600 transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearExpired}
            className="p-1 text-neutral-600 hover:text-orange-600 transition-colors"
            title="Clear expired entries"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Cached rates:</span>
          <span className="font-medium">{stats.size}</span>
        </div>

        {stats.entries.length > 0 && (
          <div className="max-h-32 overflow-y-auto">
            <div className="text-xs text-neutral-500 mb-1">Recent entries:</div>
            {stats.entries.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex justify-between text-xs text-neutral-600">
                <span>{entry.key}</span>
                <span>{entry.rate.toFixed(4)} PLN</span>
              </div>
            ))}
            {stats.entries.length > 5 && (
              <div className="text-xs text-neutral-400 text-center">
                ... and {stats.entries.length - 5} more
              </div>
            )}
          </div>
        )}

        {stats.size > 0 && (
          <div className="pt-2 border-t border-neutral-200">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Clear all cache
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
