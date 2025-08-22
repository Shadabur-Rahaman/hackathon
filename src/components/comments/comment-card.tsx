// src/components/comments/comment-card.tsx
'use client'

import React, { useState } from 'react'
import { UserAvatar } from './user-avatar'
import { CommentActions } from './comment-actions'
import { CommentInput } from './comment-input'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status?: 'online' | 'offline' | 'typing' | 'away'
}

interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
  updatedAt?: string
  isResolved: boolean
  repliesCount: number
  reactions?: {
    emoji: string
    count: number
    users: User[]
  }[]
}

interface CommentCardProps {
  comment: Comment
  currentUser: User
  users: User[]
  onResolve: (commentId: string) => void
  onUnresolve: (commentId: string) => void
  onReply: (commentId: string, content: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  onToggleReplies?: (commentId: string) => void
  showReplies?: boolean
  level?: number
  loading?: boolean
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUser,
  users,
  onResolve,
  onUnresolve,
  onReply,
  onEdit,
  onDelete,
  onToggleReplies,
  showReplies = false,
  level = 0,
  loading = false
}) => {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const canResolve = level === 0 // Only top-level comments can be resolved
  const canEdit = comment.author.id === currentUser.id
  const canDelete = comment.author.id === currentUser.id

  const handleReply = (content: string) => {
    onReply(comment.id, content)
    setIsReplying(false)
  }

  const handleEdit = (content: string) => {
    onEdit(comment.id, content)
    setIsEditing(false)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const renderContent = (content: string) => {
    // Simple mention highlighting - in production, use a proper parser
    return content.replace(/@(\w+)/g, '<span class="text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-1 rounded">@$1</span>')
  }

  return (
    <div className={`group ${level > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 ${
        comment.isResolved 
          ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className="p-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <UserAvatar 
                user={comment.author} 
                size="sm" 
                status={comment.author.status}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {comment.author.name}
                  </span>
                  {comment.author.id === currentUser.id && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {comment.isResolved && (
                    <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Resolved
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTimeAgo(comment.createdAt)}</span>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <>
                      <span>•</span>
                      <span>Edited {formatTimeAgo(comment.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <CommentActions
              commentId={comment.id}
              isResolved={comment.isResolved}
              canResolve={canResolve}
              canEdit={canEdit}
              canDelete={canDelete}
              onResolve={() => onResolve(comment.id)}
              onUnresolve={() => onUnresolve(comment.id)}
              onReply={() => setIsReplying(true)}
              onEdit={() => setIsEditing(true)}
              onDelete={() => onDelete(comment.id)}
              loading={loading}
            />
          </div>

          {/* Comment Content */}
          <div className="mb-3">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(editContent)}
                    disabled={!editContent.trim() || loading}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(comment.content) }}
              />
            )}
          </div>

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              {comment.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
                </button>
              ))}
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          )}

          {/* Replies Toggle */}
          {comment.repliesCount > 0 && level === 0 && (
            <button
              onClick={() => onToggleReplies?.(comment.id)}
              className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <span>
                {showReplies ? 'Hide' : 'Show'} {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/50">
            <CommentInput
              currentUser={currentUser}
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
              placeholder="Write a reply..."
              autoFocus
              isReply
              submitButtonText="Reply"
              users={users}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
