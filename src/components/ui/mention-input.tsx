// src/components/ui/mention-input.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UserAvatar } from '../comments/user-avatar'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  users?: User[]
  className?: string
  maxLength?: number
  rows?: number
  disabled?: boolean
  autoFocus?: boolean
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Add a comment...",
  users = [],
  className = '',
  maxLength = 1000,
  rows = 3,
  disabled = false,
  autoFocus = false
}) => {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    if (mentionQuery) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(mentionQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [mentionQuery, users])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart
    
    onChange(newValue)
    setCursorPosition(cursorPos)

    // Check for mention trigger (@)
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const words = textBeforeCursor.split(/\s/)
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionQuery(lastWord.slice(1))
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  const handleMentionSelect = (user: User) => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)
    const words = textBeforeCursor.split(/\s/)
    
    words[words.length - 1] = `@${user.name}`
    const newValue = words.join(' ') + textAfterCursor
    
    onChange(newValue)
    setShowMentions(false)
    setMentionQuery('')
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = words.join(' ').length
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
    
    if (e.key === 'Escape') {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all ${className}`}
      />
      
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {value.length}/{maxLength}
          {onSubmit && (
            <span className="ml-2">
              Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> to submit
            </span>
          )}
        </div>
      </div>

      {/* Mention Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {filteredUsers.slice(0, 5).map((user) => (
            <button
              key={user.id}
              onClick={() => handleMentionSelect(user)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <UserAvatar user={user} size="sm" showStatus={false} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
