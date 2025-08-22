// src/components/sharing/presence-indicator.tsx
'use client'

import React from 'react'

interface PresenceIndicatorProps {
  status: 'online' | 'offline' | 'pending'
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = 'md',
  showPulse = true
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'offline': return 'bg-gray-400'
      case 'pending': return 'bg-yellow-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full ${getStatusColor()} ${
      status === 'online' && showPulse ? 'animate-pulse' : ''
    }`} />
  )
}
