// components/ColorPicker.jsx
import React from 'react';
import { Check } from 'lucide-react';

const ColorPicker = ({ colors, selected, onChange, isDark }) => {
  return (
    <div className="flex items-center space-x-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`
            w-8 h-8 rounded-xl border-2 transition-all duration-200 relative
            ${selected === color 
              ? 'border-white shadow-lg scale-110' 
              : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            }
          `}
          style={{ backgroundColor: color }}
        >
          {selected === color && (
            <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ColorPicker;
