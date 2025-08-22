// src/components/comments/comment-thread.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CommentCard } from './comment-card'

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
  parentId?: string
  reactions?: {
    emoji: string
    count: number
    users: User[]
  }[]
}

interface CommentThreadProps {
  threadId: string
  comments: Comment[]
  currentUser: User
  users: User[]
  onResolve: (commentId: string) => void
  onUnresolve: (commentId: string) => void
  onReply: (parentId: string, content: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  loading?: boolean
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  threadId,
  comments,
  currentUser,
  users,
  onResolve,
  onUnresolve,
  onReply,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({})

  // Organize comments into threads
  const organizeComments = useCallback(() => {
    const topLevel = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => c.parentId)
    
    return topLevel.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parentId === comment.id)
    }))
  }, [comments])

  const threadedComments = organizeComments()

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const setCommentLoading = (commentId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [commentId]: isLoading
    }))
  }

  const handleResolve = async (commentId: string) => {
    setCommentLoading(commentId, true)
    try {
      await onResolve(commentId)
    } finally {
      setCommentLoading(commentId, false)
    }
  }

  const handleUnresolve = async (commentId: string) => {
    setCommentLoading(commentId, true)
    try {
      await onUnresolve(commentId)
    } finally {
      setCommentLoading(commentId, false)
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    setCommentLoading(parentId, true)
    try {
      await onReply(parentId, content)
      // Auto-expand replies when a new reply is added
      setExpandedReplies(prev => new Set(prev).add(parentId))
    } finally {
      setCommentLoading(parentId, false)
    }
  }

  const handleEdit = async (commentId: string, content: string) => {
    setCommentLoading(commentId, true)
    try {
      await onEdit(commentId, content)
    } finally {
      setCommentLoading(commentId, false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setCommentLoading(commentId, true)
    try {
      await onDelete(commentId)
    } finally {
      setCommentLoading(commentId, false)
    }
  }

  if (threadedComments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">No comments yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threadedComments.map((comment) => (
        <div key={comment.id}>
          <CommentCard
            comment={comment}
            currentUser={currentUser}
            users={users}
            onResolve={handleResolve}
            onUnresolve={handleUnresolve}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleReplies={toggleReplies}
            showReplies={expandedReplies.has(comment.id)}
            level={0}
            loading={loadingStates[comment.id] || loading}
          />
          
          {/* Replies */}
          {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  users={users}
                  onResolve={handleResolve}
                  onUnresolve={handleUnresolve}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  level={1}
                  loading={loadingStates[reply.id] || loading}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
