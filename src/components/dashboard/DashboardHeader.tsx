'use client';

import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import ThemeToggle from '../ThemeToggle';
import { Menu, Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ user, sidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
  const { signOut } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`border-b transition-colors duration-300 ${
      isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
    } backdrop-blur-sm`}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:block">
            <h1 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              DocEditor
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.full_name || user?.email || 'User'}
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {user?.email}
              </p>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-indigo-600' : 'bg-indigo-100'
            }`}>
              <User className={`w-4 h-4 ${
                isDark ? 'text-white' : 'text-indigo-600'
              }`} />
            </div>
            
            <button
              onClick={signOut}
              className={`text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
