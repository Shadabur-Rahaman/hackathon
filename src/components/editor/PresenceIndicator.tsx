'use client';
import React from 'react';
import { useTheme } from '../../lib/theme-context';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}

interface PresenceIndicatorProps {
  collaborators: Collaborator[];
}

export default function PresenceIndicator({ collaborators }: PresenceIndicatorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
      }`}>
        <div className="flex -space-x-1">
          {collaborators.slice(0, 3).map((collaborator) => (
            <div
              key={collaborator.id}
              className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.avatar ? (
                <img
                  src={collaborator.avatar}
                  alt={collaborator.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-white">
                  {collaborator.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className={`w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
            }`}>
              +{collaborators.length - 3}
            </div>
          )}
        </div>
        <span>{collaborators.length} online</span>
      </div>
    </div>
  );
}
