// components/Toggle.jsx
import React from 'react';

const Toggle = ({ checked, onChange, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-8'
  };

  const dotSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const handleClick = () => {
    if (typeof onChange === 'function') {
      if (onChange.length === 0) {
        // If onChange doesn't expect parameters, just call it
        onChange();
      } else {
        // If onChange expects a parameter, pass the new value
        onChange(!checked);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        ${checked 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
          : 'bg-gray-200 dark:bg-gray-600'
        }
      `}
    >
      <span
        className={`
          ${dotSizeClasses[size]}
          inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200
          ${checked 
            ? size === 'sm' ? 'translate-x-3' : size === 'md' ? 'translate-x-5' : 'translate-x-6'
            : 'translate-x-1'
          }
        `}
      />
    </button>
  );
};

export default Toggle;
