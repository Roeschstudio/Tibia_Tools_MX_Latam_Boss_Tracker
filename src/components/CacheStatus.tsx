'use client';

import { useAutoCache } from '@/hooks/useAutoCache';
import { RefreshCw, Clock, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function CacheStatus() {
  const { cacheStatus, refreshCache, getCacheStatus } = useAutoCache();

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatNextUpdate = (date: Date | null): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours}h ${remainingMinutes}m`;
  };

  const handleRefresh = async () => {
    try {
      await refreshCache();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const handleStatusCheck = async () => {
    try {
      await getCacheStatus();
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cache Status
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusCheck}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Check status"
          >
            <Clock className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={cacheStatus.isRefreshing}
            className={`p-2 rounded-md transition-colors ${
              cacheStatus.isRefreshing
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20'
            }`}
            title="Refresh cache"
          >
            <RefreshCw className={`w-4 h-4 ${cacheStatus.isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cache Status */}
        <div className="flex items-center gap-3">
          {cacheStatus.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {cacheStatus.isValid ? 'Valid' : 'Expired'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cache Status
            </p>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatTimeAgo(cacheStatus.lastUpdate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last Updated
            </p>
          </div>
        </div>

        {/* Next Update */}
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatNextUpdate(cacheStatus.nextUpdate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Next Update
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {cacheStatus.error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {cacheStatus.error}
            </p>
          </div>
        </div>
      )}

      {/* Refreshing Indicator */}
      {cacheStatus.isRefreshing && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Refreshing cache data...
            </p>
          </div>
        </div>
      )}

      {/* Cache Age Info */}
      {cacheStatus.cacheAge > 0 && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Cache age: {Math.floor(cacheStatus.cacheAge / (1000 * 60))} minutes
        </div>
      )}
    </div>
  );
}