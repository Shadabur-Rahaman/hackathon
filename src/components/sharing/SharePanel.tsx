'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { UserInvite } from './user-invite';
import { LinkGenerator } from './link-generator';

interface SharePanelProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export default function SharePanel({ 
  documentId, 
  documentTitle, 
  onClose 
}: SharePanelProps) {
  const { user } = useUser();
  const [inviting, setInviting] = useState(false);
  const [linkEnabled, setLinkEnabled] = useState(true);
  const [linkAccess, setLinkAccess] = useState<'viewer' | 'editor'>('viewer');

  const handleInviteUser = async (email: string, role: 'viewer' | 'editor') => {
    if (!user) {
      toast.error('Please sign in to send invitations');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          documentTitle,
          email,
          role,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✨ Invitation sent to ${email}!`);
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Invitation error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleToggleLinkEnabled = (enabled: boolean) => {
    setLinkEnabled(enabled);
    if (enabled) {
      toast.success('Link sharing enabled');
    } else {
      toast.success('Link sharing disabled');
    }
  };

  const handleChangeLinkAccess = (access: 'viewer' | 'editor') => {
    setLinkAccess(access);
    toast.success(`Link access changed to ${access}`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Share Document
        </h3>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close share panel"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* User Invitation Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Invite People
          </h4>
          <UserInvite 
            onInvite={handleInviteUser} 
            loading={inviting}
          />
        </div>
        
        {/* Link Generation Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Share Link
          </h4>
          <LinkGenerator
            documentId={documentId}
            linkEnabled={linkEnabled}
            linkAccess={linkAccess}
            onToggleLinkEnabled={handleToggleLinkEnabled}
            onChangeLinkAccess={handleChangeLinkAccess}
          />
        </div>

        {/* Info Tip */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 dark:text-blue-400">💡</span>
            <div>
              <strong className="text-blue-700 dark:text-blue-300">Tip:</strong>{' '}
              <span className="text-blue-600 dark:text-blue-400">
                Invited users will receive an email with a direct link to this document. 
                They can sign up or sign in to start collaborating immediately.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Document: <span className="font-medium">{documentTitle}</span>
        </p>
      </div>
    </div>
  );
}
