// src/components/ui/scrollable-panel.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'

interface ScrollablePanelProps {
  children: React.ReactNode
  className?: string
  maxHeight?: string
  autoScrollToBottom?: boolean
  showScrollIndicator?: boolean
}

export const ScrollablePanel: React.FC<ScrollablePanelProps> = ({
  children,
  className = '',
  maxHeight = 'max-h-96',
  autoScrollToBottom = false,
  showScrollIndicator = true
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(false)

  useEffect(() => {
    if (autoScrollToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [children, autoScrollToBottom])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setShowTopGradient(scrollTop > 10)
      setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 10)
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      handleScroll() // Initial check
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {showScrollIndicator && showTopGradient && (
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      
      <div
        ref={scrollRef}
        className={`overflow-y-auto ${maxHeight} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500`}
        onScroll={handleScroll}
      >
        {children}
      </div>
      
      {showScrollIndicator && showBottomGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  )
}
