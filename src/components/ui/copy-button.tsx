// src/components/ui/copy-button.tsx
'use client'

import React, { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  className = "",
  children,
  size = 'md'
}) => {
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setIsAnimating(true)
      
      setTimeout(() => setIsAnimating(false), 300)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${sizeClasses[size]} ${className} ${
        isAnimating ? 'animate-pulse' : ''
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 mr-2 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {children || 'Copy Link'}
        </>
      )}
    </button>
  )
}
