// src/components/ui/dropdown.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  description?: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        <div className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-3 text-indigo-600 dark:text-indigo-400">{selectedOption.icon}</span>
          )}
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {selectedOption?.label || placeholder}
            </span>
            {selectedOption?.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedOption.description}
              </span>
            )}
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl animate-slideDown overflow-hidden">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value)
                  setIsOpen(false)
                }
              }}
              disabled={option.disabled}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${
                index === 0 ? 'rounded-t-2xl' : ''
              } ${
                index === options.length - 1 ? 'rounded-b-2xl' : ''
              } ${
                option.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                option.value === value ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {option.icon && (
                <span className="mr-3">{option.icon}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
