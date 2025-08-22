'use client';

import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { MoreVertical, Edit, Trash2, Share2, Clock, User, Users, Globe, Lock } from 'lucide-react';

interface DocumentCardProps {
  document: any;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export default function DocumentCard({ document, viewMode, onEdit, onShare, onDelete }: DocumentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (content: any) => {
    if (!content) return 'No content';
    
    // Handle different content formats
    if (typeof content === 'string') {
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
    
    if (typeof content === 'object') {
      // For Tiptap content, extract text from JSON
      const text = JSON.stringify(content);
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    return 'Document content';
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } hover:shadow-md`}>
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
          }`}>
            <Edit className={`w-5 h-5 ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {document.title}
            </h3>
            <p className={`text-sm truncate ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getPreview(document.content)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {document.is_public ? (
              <Globe className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            ) : (
              <Lock className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            )}
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatDate(document.updated_at)}
            </span>
          </div>

          <div className="relative">
            <button className={`p-1 rounded ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <MoreVertical className="w-4 h-4" />
            </button>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border transition-colors ${
      isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
    } hover:shadow-lg cursor-pointer`} onClick={onEdit}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
        }`}>
          <Edit className={`w-5 h-5 ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`} />
        </div>
        
        <div className="flex items-center space-x-1">
          {document.is_public ? (
            <Globe className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
          ) : (
            <Lock className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
          )}
        </div>
      </div>

      <h3 className={`font-medium mb-2 line-clamp-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {document.title}
      </h3>
      
      <p className={`text-sm mb-4 line-clamp-3 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {getPreview(document.content)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formatDate(document.updated_at)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {document.owner_id === document.owner?.id ? (
            <User className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
          ) : (
            <Users className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
