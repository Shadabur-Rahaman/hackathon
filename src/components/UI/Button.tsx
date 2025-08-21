// src/components/ui/button.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 focus:ring-indigo-500 shadow-sm",
      secondary: "bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:ring-indigo-500",
      ghost: "text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:ring-indigo-500"
    }
    
    const sizes = {
      sm: "py-2 px-4 text-sm",
      md: "py-3 px-6 text-base",
      lg: "py-4 px-8 text-lg"
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
