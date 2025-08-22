// src/components/sharing/share-modal.tsx
'use client'

import React, { useState } from 'react'
import { Modal } from '../ui/modal'
import { LinkGenerator } from './link-generator'
import { UserInvite } from './user-invite'
import { CollaboratorList } from './collaborator-list'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'pending'
  avatar?: string
  lastSeen?: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
  collaborators: Collaborator[]
  currentUserId: string
  linkEnabled: boolean
  linkAccess: 'viewer' | 'editor'
  onToggleLinkEnabled: (enabled: boolean) => void
  onChangeLinkAccess: (access: 'viewer' | 'editor') => void
  onInviteUser: (email: string, role: 'viewer' | 'editor') => Promise<void>
  onRoleChange: (userId: string, newRole: 'editor' | 'viewer') => void
  onRemoveUser: (userId: string) => void
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  collaborators,
  currentUserId,
  linkEnabled,
  linkAccess,
  onToggleLinkEnabled,
  onChangeLinkAccess,
  onInviteUser,
  onRoleChange,
  onRemoveUser
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'people'>('link')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${documentTitle}"`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'link'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Share Link</span>
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'people'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>People ({collaborators.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'link' && (
            <LinkGenerator
              documentId={documentId}
              linkEnabled={linkEnabled}
              linkAccess={linkAccess}
              onToggleLinkEnabled={onToggleLinkEnabled}
              onChangeLinkAccess={onChangeLinkAccess}
            />
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              <UserInvite onInvite={onInviteUser} />
              
              <CollaboratorList
                collaborators={collaborators}
                currentUserId={currentUserId}
                onRoleChange={onRoleChange}
                onRemoveUser={onRemoveUser}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Document will auto-save changes made by collaborators
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
