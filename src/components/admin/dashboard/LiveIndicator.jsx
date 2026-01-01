// components/admin/dashboard/LiveIndicator.jsx
// Phase 11: Real-time update indicator

'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function LiveIndicator({
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  refreshInterval = 60000
}) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const updated = new Date(lastUpdated);
      const diffMs = now - updated;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);

      if (diffSeconds < 10) {
        setTimeAgo('עכשיו');
        setIsLive(true);
      } else if (diffSeconds < 60) {
        setTimeAgo(`לפני ${diffSeconds} שניות`);
        setIsLive(true);
      } else if (diffMinutes < 5) {
        setTimeAgo(`לפני ${diffMinutes} דקות`);
        setIsLive(true);
      } else if (diffMinutes < 60) {
        setTimeAgo(`לפני ${diffMinutes} דקות`);
        setIsLive(false);
      } else {
        setTimeAgo('לא עודכן');
        setIsLive(false);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-3">
      {/* Live Status */}
      <div className="flex items-center gap-1.5">
        {isLive ? (
          <>
            <div className="relative">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">לא מחובר</span>
          </>
        )}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-200" />

      {/* Last Updated */}
      <span className="text-xs text-gray-500">
        עודכן {timeAgo}
      </span>

      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="רענן עכשיו"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
