// src/components/comments/user-avatar.tsx
'use client'

import React from 'react'

interface UserAvatarProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  size?: 'xs' | 'sm' | 'md' | 'lg'
  status?: 'online' | 'offline' | 'typing' | 'away'
  showStatus?: boolean
  className?: string
  onClick?: () => void
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  status = 'offline',
  showStatus = true,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    typing: 'bg-blue-400 animate-pulse',
    away: 'bg-yellow-400'
  }

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  }

  const generateAvatar = (name: string) => {
    const colors = [
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-blue-500 to-indigo-500',
      'bg-gradient-to-r from-green-500 to-teal-500',
      'bg-gradient-to-r from-yellow-500 to-orange-500',
      'bg-gradient-to-r from-red-500 to-pink-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500'
    ]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm ${
          onClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-800 transition-all' : ''
        }`}
        onClick={onClick}
        title={`${user.name} (${user.email})`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${generateAvatar(user.name)}`}>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
      </div>
      
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-2 border-white dark:border-gray-900 ${statusColors[status]}`} />
      )}
    </div>
  )
}
