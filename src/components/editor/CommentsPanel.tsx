'use client';
import React, { useState } from 'react';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
// Simple time formatting function
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  parent_id?: string;
  anchor_from?: number;
  anchor_to?: number;
  status: 'open' | 'resolved';
  replies?: Comment[];
}

interface CommentsPanelProps {
  comments: Comment[];
  onCreateComment: (content: string, parentId?: string, anchorFrom?: number, anchorTo?: number) => void;
  onClose: () => void;
}

export default function CommentsPanel({
  comments,
  onCreateComment,
  onClose
}: CommentsPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useDashboardStore();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Group comments by parent (threading)
  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.parent_id) {
      acc[comment.id] = {
        ...comment,
        replies: comments.filter(c => c.parent_id === comment.id)
      };
    }
    return acc;
  }, {} as Record<string, Comment & { replies: Comment[] }>);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onCreateComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onCreateComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`mb-4 ${isReply ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className={`flex items-start space-x-3 p-3 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`font-medium text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {comment.author.name}
            </span>
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatTimeAgo(comment.created_at)}
            </span>
            {comment.status === 'resolved' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Resolved
              </span>
            )}
          </div>
          
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {comment.content}
          </div>

          {/* Comment actions */}
          <div className="flex items-center space-x-4 mt-3">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className={`text-xs hover:underline ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              >
                Reply
              </button>
            )}
            
            {comment.anchor_from !== undefined && comment.anchor_to !== undefined && (
              <button
                onClick={() => {
                  // This would highlight the text in the editor
                  console.log('Highlight text from', comment.anchor_from, 'to', comment.anchor_to);
                }}
                className={`text-xs hover:underline ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              >
                Go to text
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className={`w-full p-2 text-sm border rounded-lg resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={3}
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    replyContent.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

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
          Comments ({comments.length})
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

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.values(groupedComments).length === 0 ? (
          <div className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          <div>
            {Object.values(groupedComments).map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      {/* New comment form */}
      <div className={`p-4 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-start space-x-3">
          {/* User avatar */}
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className={`w-full p-3 text-sm border rounded-lg resize-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // This would add an inline comment at the current selection
                    console.log('Add inline comment');
                  }}
                  className={`text-xs hover:underline ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`}
                >
                  Add inline comment
                </button>
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  newComment.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
