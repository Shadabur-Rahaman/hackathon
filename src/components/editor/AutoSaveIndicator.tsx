'use client';
import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';

// Simple time formatting function
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default function AutoSaveIndicator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { saving, lastSaved } = useDashboardStore();

  return (
    <div className="flex items-center space-x-2">
      {saving ? (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Saving...</span>
        </div>
      ) : lastSaved ? (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Saved {formatTimeAgo(lastSaved)}</span>
        </div>
      ) : (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>Not saved</span>
        </div>
      )}
    </div>
  );
}
