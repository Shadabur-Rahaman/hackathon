// components/Slider.jsx
import React from 'react';

const Slider = ({ value, onChange, min, max, step, isDark }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`
          w-full h-2 rounded-lg appearance-none cursor-pointer
          ${isDark ? 'bg-gray-600' : 'bg-gray-200'}
        `}
        style={{
          background: `linear-gradient(to right, 
            rgb(99 102 241) 0%, 
            rgb(139 92 246) ${percentage}%, 
            ${isDark ? 'rgb(75 85 99)' : 'rgb(229 231 235)'} ${percentage}%, 
            ${isDark ? 'rgb(75 85 99)' : 'rgb(229 231 235)'} 100%)`
        }}
      />
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Slider;
