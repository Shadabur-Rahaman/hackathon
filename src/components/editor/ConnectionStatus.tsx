'use client';
import React from 'react';
import { useTheme } from '../../lib/theme-context';

interface ConnectionStatusProps {
  isOffline: boolean;
}

export default function ConnectionStatus({ isOffline }: ConnectionStatusProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
        isOffline
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOffline ? 'bg-red-500' : 'bg-green-500'
        }`}></div>
        <span>{isOffline ? 'Offline' : 'Online'}</span>
      </div>
    </div>
  );
}
