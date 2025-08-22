'use client';

import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { FileText, Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onCreateDocument: () => void;
}

export default function EmptyState({ searchQuery, onCreateDocument }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (searchQuery) {
    return (
      <div className="text-center py-12">
        <Search className={`w-12 h-12 mx-auto mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-300'
        }`} />
        <h3 className={`text-lg font-medium mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          No documents found
        </h3>
        <p className={`${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No documents match "{searchQuery}". Try adjusting your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className={`w-16 h-16 mx-auto mb-6 ${
        isDark ? 'text-gray-400' : 'text-gray-300'
      }`} />
      <h3 className={`text-xl font-semibold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        No documents yet
      </h3>
      <p className={`mb-6 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Create your first document to get started with collaborative editing.
      </p>
      <button
        onClick={onCreateDocument}
        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
          isDark
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Document
      </button>

      {/* Feature highlights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg ${
          isDark ? 'bg-gray-800/50' : 'bg-white/50'
        }`}>
          <div className={`w-8 h-8 rounded-lg mb-3 ${
            isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
          }`}></div>
          <h4 className={`font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Real-time Collaboration
          </h4>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Edit together with live cursors and instant updates
          </p>
        </div>

        <div className={`p-6 rounded-lg ${
          isDark ? 'bg-gray-800/50' : 'bg-white/50'
        }`}>
          <div className={`w-8 h-8 rounded-lg mb-3 ${
            isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
          }`}></div>
          <h4 className={`font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Auto-save
          </h4>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Never lose your work with automatic saving
          </p>
        </div>

        <div className={`p-6 rounded-lg ${
          isDark ? 'bg-gray-800/50' : 'bg-white/50'
        }`}>
          <div className={`w-8 h-8 rounded-lg mb-3 ${
            isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
          }`}></div>
          <h4 className={`font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Version History
          </h4>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track changes and revert to previous versions
          </p>
        </div>
      </div>
    </div>
  );
}
