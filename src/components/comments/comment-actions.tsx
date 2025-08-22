// src/components/comments/comment-actions.tsx
'use client'

import React, { useState } from 'react'

interface CommentActionsProps {
  commentId: string
  isResolved: boolean
  canResolve: boolean
  canDelete: boolean
  canEdit: boolean
  onResolve: () => void
  onUnresolve: () => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  loading?: boolean
}

export const CommentActions: React.FC<CommentActionsProps> = ({
  commentId,
  isResolved,
  canResolve,
  canDelete,
  canEdit,
  onResolve,
  onUnresolve,
  onReply,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleDeleteClick = () => {
    if (showConfirmDelete) {
      onDelete()
      setShowConfirmDelete(false)
    } else {
      setShowConfirmDelete(true)
      setTimeout(() => setShowConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Reply Button */}
      <button
        onClick={onReply}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
        title="Reply to comment"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      {/* Resolve/Unresolve Button */}
      {canResolve && (
        <button
          onClick={isResolved ? onUnresolve : onResolve}
          disabled={loading}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            isResolved
              ? 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
          title={isResolved ? 'Unresolve comment' : 'Resolve comment'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {/* Edit Button */}
      {canEdit && (
        <button
          onClick={onEdit}
          disabled={loading}
          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
          title="Edit comment"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={handleDeleteClick}
          disabled={loading}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            showConfirmDelete
              ? 'text-red-700 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          title={showConfirmDelete ? 'Click again to confirm deletion' : 'Delete comment'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
