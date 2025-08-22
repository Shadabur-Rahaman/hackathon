'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
import { shareApi } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ShareLink {
  id: string;
  link_token: string;
  role: 'viewer' | 'editor';
  expires_at?: string;
  created_at: string;
  creator: {
    name: string;
  };
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  email: string;
}

interface SharePanelProps {
  documentId: string;
  onClose: () => void;
}

export default function SharePanel({ documentId, onClose }: SharePanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useDashboardStore();
  
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeTab, setActiveTab] = useState<'share' | 'collaborators'>('share');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareExpiry, setShareExpiry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load share links and collaborators
  useEffect(() => {
    const loadData = async () => {
      try {
        const [linksData, collaboratorsData] = await Promise.all([
          shareApi.getShareLinks(documentId),
          // This would be replaced with actual collaborator API
          Promise.resolve([])
        ]);
        setShareLinks(linksData);
        setCollaborators(collaboratorsData);
      } catch (error) {
        console.error('Failed to load share data:', error);
      }
    };

    loadData();
  }, [documentId]);

  const handleCreateShareLink = async () => {
    try {
      setIsLoading(true);
      const expiryDate = shareExpiry ? new Date(shareExpiry) : undefined;
      const newLink = await shareApi.createShareLink(documentId, shareRole, expiryDate);
      setShareLinks(prev => [newLink, ...prev]);
      toast.success('Share link created');
    } catch (error) {
      console.error('Failed to create share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShareLink = async (linkId: string) => {
    try {
      await shareApi.deleteShareLink(linkId);
      setShareLinks(prev => prev.filter(link => link.id !== linkId));
      toast.success('Share link deleted');
    } catch (error) {
      console.error('Failed to delete share link:', error);
      toast.error('Failed to delete share link');
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;

    try {
      setIsLoading(true);
      // This would integrate with the collaborator API
      toast.success('Collaborator invited');
      setNewCollaboratorEmail('');
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      toast.error('Failed to add collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      // This would integrate with the collaborator API
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      toast.success('Collaborator removed');
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/doc/shared/${token}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

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
          Share Document
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

      {/* Tabs */}
      <div className={`flex border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={() => setActiveTab('share')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'share'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Share Links
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'collaborators'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Collaborators
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'share' ? (
          <div className="p-4">
            {/* Create new share link */}
            <div className={`p-4 rounded-lg border ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-medium mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Create Share Link
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Permission
                  </label>
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor')}
                    className={`w-full p-2 text-sm border rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Expiry Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value)}
                    className={`w-full p-2 text-sm border rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <button
                  onClick={handleCreateShareLink}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create Share Link'}
                </button>
              </div>
            </div>

            {/* Share links list */}
            <div className="mt-6">
              <h4 className={`font-medium mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Active Share Links
              </h4>
              
              {shareLinks.length === 0 ? (
                <div className={`text-center py-8 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <p className="text-sm">No share links yet</p>
                  <p className="text-xs mt-1">Create a link to share this document</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-3 rounded-lg border ${
                        isExpired(link.expires_at)
                          ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                          : isDark
                            ? 'border-gray-700 bg-gray-800'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          link.role === 'editor'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {link.role}
                        </span>
                        {isExpired(link.expires_at) && (
                          <span className="text-xs text-red-600 dark:text-red-400">
                            Expired
                          </span>
                        )}
                      </div>
                      
                      <div className={`text-sm mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {getShareUrl(link.link_token)}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Created {formatDate(link.created_at)}</span>
                        {link.expires_at && (
                          <span>Expires {formatDate(link.expires_at)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(getShareUrl(link.link_token))}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDark 
                              ? 'text-indigo-400 hover:bg-indigo-900' 
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteShareLink(link.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-900' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Add collaborator */}
            <div className={`p-4 rounded-lg border ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-medium mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Add Collaborator
              </h4>
              
              <div className="space-y-3">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full p-2 text-sm border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                <select
                  value={newCollaboratorRole}
                  onChange={(e) => setNewCollaboratorRole(e.target.value as 'viewer' | 'editor')}
                  className={`w-full p-2 text-sm border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>

                <button
                  onClick={handleAddCollaborator}
                  disabled={!newCollaboratorEmail.trim() || isLoading}
                  className={`w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                    !newCollaboratorEmail.trim() || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Adding...' : 'Add Collaborator'}
                </button>
              </div>
            </div>

            {/* Collaborators list */}
            <div className="mt-6">
              <h4 className={`font-medium mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Collaborators ({collaborators.length})
              </h4>
              
              {collaborators.length === 0 ? (
                <div className={`text-center py-8 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-sm">No collaborators yet</p>
                  <p className="text-xs mt-1">Add people to collaborate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {collaborator.avatar ? (
                          <img
                            src={collaborator.avatar}
                            alt={collaborator.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {collaborator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div>
                          <div className={`font-medium text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {collaborator.name}
                          </div>
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {collaborator.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          collaborator.role === 'owner'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : collaborator.role === 'editor'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {collaborator.role}
                        </span>
                        
                        {collaborator.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              isDark 
                                ? 'text-red-400 hover:bg-red-900' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
