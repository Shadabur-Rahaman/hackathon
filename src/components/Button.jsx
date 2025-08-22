// components/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
      hover:from-indigo-700 hover:to-purple-700 
      focus:ring-indigo-500 shadow-lg hover:shadow-xl
      disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700
      hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-indigo-500
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600
      hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-indigo-500
      disabled:text-gray-400 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-gray-600 dark:text-gray-400 
      hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-indigo-500
      disabled:text-gray-400 disabled:cursor-not-allowed
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
