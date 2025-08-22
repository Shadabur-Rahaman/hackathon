// components/SettingsCard.jsx
import React from 'react';

const SettingsCard = ({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  isDark, 
  className = "" 
}) => {
  return (
    <div className={`
      ${isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      } 
      border rounded-2xl p-6 shadow-lg backdrop-blur-sm 
      transition-all duration-300 hover:shadow-xl
      ${className}
    `}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-xl ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
            : 'bg-gradient-to-br from-indigo-100 to-purple-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            isDark ? 'text-white' : 'text-indigo-600'
          }`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default SettingsCard;
