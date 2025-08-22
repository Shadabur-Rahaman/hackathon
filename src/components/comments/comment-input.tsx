// src/components/comments/comment-input.tsx
'use client'

import React, { useState } from 'react'
import { MentionInput } from '../ui/mention-input'
import { UserAvatar } from './user-avatar'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface CommentInputProps {
  currentUser: User
  onSubmit: (content: string) => void
  placeholder?: string
  autoFocus?: boolean
  maxLength?: number
  isReply?: boolean
  onCancel?: () => void
  submitButtonText?: string
  loading?: boolean
  users?: User[]
}

export const CommentInput: React.FC<CommentInputProps> = ({
  currentUser,
  onSubmit,
  placeholder = "Add a comment...",
  autoFocus = false,
  maxLength = 1000,
  isReply = false,
  onCancel,
  submitButtonText = "Comment",
  loading = false,
  users = []
}) => {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = () => {
    if (content.trim() && !loading) {
      onSubmit(content.trim())
      setContent('')
      setIsFocused(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setIsFocused(false)
    onCancel?.()
  }

  const canSubmit = content.trim().length > 0 && !loading

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm ${
      isFocused ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 border-indigo-300 dark:border-indigo-600' : ''
    }`}>
      <div className="flex space-x-3">
        <UserAvatar user={currentUser} size="sm" />
        
        <div className="flex-1 space-y-3" onFocus={() => setIsFocused(true)}>
          <MentionInput
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            placeholder={placeholder}
            users={users}
            maxLength={maxLength}
            rows={isFocused || content ? 3 : 1}
            autoFocus={autoFocus}
            className={`transition-all duration-200 ${
              !isFocused && !content ? 'cursor-pointer' : ''
            }`}
          />
          
          {(isFocused || content) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Add emoji"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12l-2-7H7l-2 7z" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Attach file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {(isReply || onCancel) && (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  {loading && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                    </svg>
                  )}
                  {submitButtonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
