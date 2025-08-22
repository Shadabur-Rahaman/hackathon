// src/components/sharing/collaborator-list.tsx
'use client'

import React, { useState } from 'react'
import { Dropdown } from '../ui/dropdown'
import { PresenceIndicator } from './presence-indicator'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'pending'
  avatar?: string
  lastSeen?: string
  joinedAt?: string
}

interface CollaboratorListProps {
  collaborators: Collaborator[]
  currentUserId: string
  onRoleChange: (userId: string, newRole: 'editor' | 'viewer') => void
  onRemoveUser: (userId: string) => void
}

export const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  currentUserId,
  onRoleChange,
  onRemoveUser
}) => {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const roleOptions = [
    {
      value: 'viewer',
      label: 'Can view',
      description: 'View and comment only',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      value: 'editor',
      label: 'Can edit',
      description: 'View, comment, and edit',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    }
  ]

  const getStatusText = (status: string, lastSeen?: string) => {
    switch (status) {
      case 'online': return 'Active now'
      case 'offline': return lastSeen ? `Last seen ${lastSeen}` : 'Offline'
      case 'pending': return 'Pending invitation'
      default: return 'Unknown'
    }
  }

  const handleRemoveUser = (userId: string) => {
    if (confirmRemove === userId) {
      onRemoveUser(userId)
      setConfirmRemove(null)
    } else {
      setConfirmRemove(userId)
      setTimeout(() => setConfirmRemove(null), 5000)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          People with access
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {collaborators.length} member{collaborators.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-1">
            <PresenceIndicator status="online" size="sm" />
            <span className="text-xs text-green-600 dark:text-green-400">
              {collaborators.filter(c => c.status === 'online').length} online
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                {collaborator.avatar ? (
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                    {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5">
                  <PresenceIndicator status={collaborator.status} size="md" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {collaborator.name}
                    {collaborator.id === currentUserId && (
                      <span className="ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  {collaborator.role === 'owner' && (
                    <span className="text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {collaborator.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <PresenceIndicator status={collaborator.status} size="sm" showPulse={false} />
                  <span className="ml-1">{getStatusText(collaborator.status, collaborator.lastSeen)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {collaborator.role !== 'owner' && (
                <>
                  <Dropdown
                    options={roleOptions}
                    value={collaborator.role}
                    onChange={(newRole) => onRoleChange(collaborator.id, newRole as 'editor' | 'viewer')}
                    className="w-40"
                    disabled={collaborator.id === currentUserId}
                  />
                  
                  {collaborator.id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveUser(collaborator.id)}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        confirmRemove === collaborator.id
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={confirmRemove === collaborator.id ? 'Click again to confirm removal' : 'Remove user'}
                    >
                      {confirmRemove === collaborator.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
