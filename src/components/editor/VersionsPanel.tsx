'use client';
import React, { useState } from 'react';
import { useTheme } from '../../lib/theme-context';
// Simple time formatting function
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
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

interface Version {
  id: string;
  message: string;
  branch: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  parent_id?: string;
  merge_parent_id?: string;
}

interface VersionsPanelProps {
  versions: Version[];
  onRestore: (versionId: string) => void;
  onCreateBranch: (branchName: string, fromBranch: string) => void;
  onCreateMergeRequest: (sourceBranch: string, targetBranch: string, title: string, description?: string) => void;
  onClose: () => void;
}

export default function VersionsPanel({
  versions,
  onRestore,
  onCreateBranch,
  onCreateMergeRequest,
  onClose
}: VersionsPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [showCreateMergeRequest, setShowCreateMergeRequest] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [mergeRequestTitle, setMergeRequestTitle] = useState('');
  const [mergeRequestDescription, setMergeRequestDescription] = useState('');
  const [sourceBranch, setSourceBranch] = useState('');

  // Get unique branches
  const branches = Array.from(new Set(versions.map(v => v.branch))).sort();
  
  // Filter versions by selected branch
  const branchVersions = versions
    .filter(v => v.branch === selectedBranch)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim(), selectedBranch);
      setNewBranchName('');
      setShowCreateBranch(false);
    }
  };

  const handleCreateMergeRequest = () => {
    if (mergeRequestTitle.trim() && sourceBranch) {
      onCreateMergeRequest(sourceBranch, selectedBranch, mergeRequestTitle.trim(), mergeRequestDescription);
      setMergeRequestTitle('');
      setMergeRequestDescription('');
      setSourceBranch('');
      setShowCreateMergeRequest(false);
    }
  };

  const VersionItem = ({ version, isLatest = false }: { version: Version; isLatest?: boolean }) => (
    <div className={`p-3 rounded-lg border ${
      isLatest 
        ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20' 
        : isDark 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Commit indicator */}
        <div className="flex-shrink-0">
          <div className={`w-3 h-3 rounded-full ${
            isLatest ? 'bg-indigo-500' : 'bg-gray-400'
          }`}></div>
          {!isLatest && (
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mx-auto mt-1"></div>
          )}
        </div>

        {/* Version content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`font-medium text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {version.message}
            </span>
            {isLatest && (
              <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
                Latest
              </span>
            )}
            {version.merge_parent_id && (
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                Merge
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>{version.author.name}</span>
            <span>{formatTimeAgo(version.created_at)}</span>
            <span className="text-indigo-600 dark:text-indigo-400">{version.branch}</span>
          </div>

          {/* Version actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRestore(version.id)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isDark 
                  ? 'text-indigo-400 hover:bg-indigo-900' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Restore
            </button>
            {!isLatest && (
              <button
                onClick={() => {
                  setSourceBranch(version.branch);
                  setShowCreateMergeRequest(true);
                }}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isDark 
                    ? 'text-purple-400 hover:bg-purple-900' 
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                Create MR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-80 border-l ${
      isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Version History
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Branch selector */}
      <div className={`p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className={`text-sm border rounded-lg px-3 py-2 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {branches.map(branch => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateBranch(true)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isDark 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            New Branch
          </button>
        </div>

        {/* Branch info */}
        <div className={`text-xs ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {branchVersions.length} commits on {selectedBranch}
        </div>
      </div>

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto p-4">
        {branchVersions.length === 0 ? (
          <div className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No versions yet</p>
            <p className="text-xs mt-1">Start editing to create versions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {branchVersions.map((version, index) => (
              <VersionItem 
                key={version.id} 
                version={version} 
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Branch Modal */}
      {showCreateBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 p-6 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Create New Branch
            </h3>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Branch name"
              className={`w-full p-3 border rounded-lg mb-4 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  newBranchName.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Branch
              </button>
              <button
                onClick={() => {
                  setShowCreateBranch(false);
                  setNewBranchName('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Merge Request Modal */}
      {showCreateMergeRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 p-6 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Create Merge Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Source Branch
                </label>
                <select
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select source branch</option>
                  {branches.filter(b => b !== selectedBranch).map(branch => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title
                </label>
                <input
                  type="text"
                  value={mergeRequestTitle}
                  onChange={(e) => setMergeRequestTitle(e.target.value)}
                  placeholder="Merge request title"
                  className={`w-full p-3 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (optional)
                </label>
                <textarea
                  value={mergeRequestDescription}
                  onChange={(e) => setMergeRequestDescription(e.target.value)}
                  placeholder="Describe your changes..."
                  rows={3}
                  className={`w-full p-3 border rounded-lg resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <button
                onClick={handleCreateMergeRequest}
                disabled={!mergeRequestTitle.trim() || !sourceBranch}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mergeRequestTitle.trim() && sourceBranch
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Merge Request
              </button>
              <button
                onClick={() => {
                  setShowCreateMergeRequest(false);
                  setMergeRequestTitle('');
                  setMergeRequestDescription('');
                  setSourceBranch('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
