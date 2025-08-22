// src/components/sharing/link-generator.tsx
'use client'

import React from 'react'
import { CopyButton } from '../ui/copy-button'
import { Dropdown } from '../ui/dropdown'
import { ToggleSwitch } from '../ui/toggle-switch'

interface LinkGeneratorProps {
  documentId: string
  linkEnabled: boolean
  linkAccess: 'viewer' | 'editor'
  onToggleLinkEnabled: (enabled: boolean) => void
  onChangeLinkAccess: (access: 'viewer' | 'editor') => void
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({
  documentId,
  linkEnabled,
  linkAccess,
  onToggleLinkEnabled,
  onChangeLinkAccess
}) => {
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/document/${documentId}?share=true`

  const accessOptions = [
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

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share with link
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Anyone with this link can access the document
          </p>
        </div>
        
        <ToggleSwitch
          enabled={linkEnabled}
          onChange={onToggleLinkEnabled}
          label="Enable sharing"
        />
      </div>

      {linkEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600 dark:text-gray-300 font-mono"
              />
            </div>
            <CopyButton text={shareLink} />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Link permissions:
            </span>
            <Dropdown
              options={accessOptions}
              value={linkAccess}
              onChange={(value) => onChangeLinkAccess(value as 'viewer' | 'editor')}
              className="w-48"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                  Security Notice
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Anyone with this link {linkAccess === 'viewer' ? 'can view' : 'can edit'} this document. Share responsibly.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Link sharing is disabled
          </p>
        </div>
      )}
    </div>
  )
}
