// components/Select.jsx
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ value, onChange, options, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl border transition-colors duration-200 text-left flex items-center justify-between
          ${isDark 
            ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' 
            : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        `}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        } ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>

      {isOpen && (
        <div className={`
          absolute top-full left-0 right-0 mt-2 py-2 rounded-xl border shadow-xl z-10
          ${isDark 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
          }
        `}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left transition-colors duration-200 flex items-center justify-between
                ${isDark 
                  ? 'text-white hover:bg-gray-600' 
                  : 'text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className={`w-4 h-4 ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
