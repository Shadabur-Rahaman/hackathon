// src/components/comments/comments-panel.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ScrollablePanel } from '../ui/scrollable-panel'
import { CommentInput } from './comment-input'
import { CommentThread } from './comment-thread'
import { UserAvatar } from './user-avatar'

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
  threadId?: string
  reactions?: {
    emoji: string
    count: number
    users: User[]
  }[]
}

interface CommentsPanelProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  currentUser: User
  users: User[]
  className?: string
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: 'user2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7e5e11e?w=40&h=40&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: 'user3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'offline'
  }
]

const mockComments: Comment[] = [
  {
    id: 'comment1',
    content: 'This section needs more detail about the implementation approach. Can we add some technical specifications?',
    author: mockUsers[1],
    createdAt: '2025-08-21T10:30:00Z',
    isResolved: false,
    repliesCount: 2,
    threadId: 'thread1'
  },
  {
    id: 'comment2',
    content: 'I agree with @Alice. We should also consider the performance implications of this approach.',
    author: mockUsers[0],
    createdAt: '2025-08-21T10:35:00Z',
    isResolved: false,
    repliesCount: 0,
    parentId: 'comment1',
    threadId: 'thread1'
  },
  {
    id: 'comment3',
    content: 'Let me add some benchmarking data to support this.',
    author: mockUsers[2],
    createdAt: '2025-08-21T11:00:00Z',
    isResolved: false,
    repliesCount: 0,
    parentId: 'comment1',
    threadId: 'thread1'
  },
  {
    id: 'comment4',
    content: 'Great work on the visual design! This looks much cleaner than the previous version.',
    author: mockUsers[1],
    createdAt: '2025-08-21T09:15:00Z',
    isResolved: true,
    repliesCount: 0,
    threadId: 'thread2'
  }
]

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  isOpen,
  onClose,
  documentId,
  currentUser,
  users = mockUsers,
  className = ''
}) => {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const panelRef = useRef<HTMLDivElement>(null)

  // Filter comments based on current filter
  const filteredComments = comments.filter(comment => {
    if (filter === 'resolved') return comment.isResolved && !comment.parentId
    if (filter === 'unresolved') return !comment.isResolved && !comment.parentId
    return true
  })

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // Group comments by thread
  const commentsByThread = useCallback(() => {
    const threads: {[key: string]: Comment[]} = {}
    comments.forEach(comment => {
      const threadId = comment.threadId || comment.id
      if (!threads[threadId]) threads[threadId] = []
      threads[threadId].push(comment)
    })
    return threads
  }, [comments])

  const addComment = async (content: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        isResolved: false,
        repliesCount: 0,
        threadId: `thread-${Date.now()}`
      }
      
      setComments(prev => [newComment, ...prev])
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const addReply = async (parentId: string, content: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const parentComment = comments.find(c => c.id === parentId)
      const newReply: Comment = {
        id: `reply-${Date.now()}`,
        content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        isResolved: false,
        repliesCount: 0,
        parentId,
        threadId: parentComment?.threadId || parentId
      }
      
      setComments(prev => [
        ...prev.map(c => 
          c.id === parentId 
            ? { ...c, repliesCount: c.repliesCount + 1 }
            : c
        ),
        newReply
      ])
    } catch (error) {
      console.error('Failed to add reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveComment = async (commentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setComments(prev => 
        prev.map(c => 
          c.id === commentId ? { ...c, isResolved: true } : c
        )
      )
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const unresolveComment = async (commentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setComments(prev => 
        prev.map(c => 
          c.id === commentId ? { ...c, isResolved: false } : c
        )
      )
    } catch (error) {
      console.error('Failed to unresolve comment:', error)
    }
  }

  const editComment = async (commentId: string, content: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setComments(prev => 
        prev.map(c => 
          c.id === commentId 
            ? { ...c, content, updatedAt: new Date().toISOString() } 
            : c
        )
      )
    } catch (error) {
      console.error('Failed to edit comment:', error)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const comment = comments.find(c => c.id === commentId)
      
      setComments(prev => {
        const filtered = prev.filter(c => c.id !== commentId && c.parentId !== commentId)
        
        // Update parent's reply count if this was a reply
        if (comment?.parentId) {
          return filtered.map(c => 
            c.id === comment.parentId 
              ? { ...c, repliesCount: Math.max(0, c.repliesCount - 1) }
              : c
          )
        }
        
        return filtered
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  // Stats
  const totalComments = comments.filter(c => !c.parentId).length
  const unresolvedComments = comments.filter(c => !c.isResolved && !c.parentId).length
  const resolvedComments = comments.filter(c => c.isResolved && !c.parentId).length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${className}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
              {totalComments} total
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
              {unresolvedComments} open
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              {resolvedComments} resolved
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unresolved', label: 'Open' },
                { key: 'resolved', label: 'Resolved' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === tab.key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className={`w-4 h-4 mr-1 transition-transform ${sortBy === 'oldest' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {sortBy === 'newest' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">Online now:</span>
            <div className="flex -space-x-2">
              {users.filter(u => u.status === 'online').slice(0, 5).map((user) => (
                <UserAvatar 
                  key={user.id} 
                  user={user} 
                  size="xs" 
                  status={user.status}
                  className="ring-2 ring-white dark:ring-gray-900"
                />
              ))}
              {users.filter(u => u.status === 'online').length > 5 && (
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-900">
                  +{users.filter(u => u.status === 'online').length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments List */}
        <ScrollablePanel 
          className="flex-1" 
          maxHeight="h-full" 
          autoScrollToBottom={false}
          showScrollIndicator
        >
          <div className="px-6 py-4 space-y-4">
            {sortedComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm mb-2">
                  {filter === 'resolved' ? 'No resolved comments' : 
                   filter === 'unresolved' ? 'No open comments' : 'No comments yet'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {filter === 'all' ? 'Start a conversation by adding the first comment' : 'Comments will appear here when available'}
                </p>
              </div>
            ) : (
              Object.entries(commentsByThread()).map(([threadId, threadComments]) => {
                const mainComment = threadComments.find(c => !c.parentId)
                if (!mainComment || 
                    (filter === 'resolved' && !mainComment.isResolved) ||
                    (filter === 'unresolved' && mainComment.isResolved)) {
                  return null
                }
                
                return (
                  <CommentThread
                    key={threadId}
                    threadId={threadId}
                    comments={threadComments}
                    currentUser={currentUser}
                    users={users}
                    onResolve={resolveComment}
                    onUnresolve={unresolveComment}
                    onReply={addReply}
                    onEdit={editComment}
                    onDelete={deleteComment}
                    loading={loading}
                  />
                )
              })
            )}
          </div>
        </ScrollablePanel>

        {/* Add Comment */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CommentInput
            currentUser={currentUser}
            onSubmit={addComment}
            placeholder="Add a comment..."
            users={users}
            loading={loading}
            maxLength={1000}
          />
        </div>
      </div>
    </>
  )
}
