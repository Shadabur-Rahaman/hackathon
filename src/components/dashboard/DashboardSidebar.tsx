'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../../lib/theme-context';
import { FileText, Users, Star, Settings } from 'lucide-react';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
}

export default function DashboardSidebar({ sidebarOpen }: DashboardSidebarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    { icon: FileText, label: 'Documents', href: '/dashboard' },
    { icon: Users, label: 'Shared', href: '/dashboard/shared' },
    { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-full w-64 transform transition-transform duration-300 ease-in-out z-30 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0`}>
      <div className={`h-full border-r transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm`}>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
