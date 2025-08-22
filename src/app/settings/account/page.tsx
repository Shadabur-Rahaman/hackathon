'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, Key, Download, Trash2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { emailService } from '../../../lib/email-service';
import { exportService } from '../../../lib/export-service';
import { useTheme } from '../../../lib/theme-context';

export default function AccountSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software developer passionate about collaborative tools and real-time editing.'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send email notification
      await emailService.sendAccountUpdateEmail(profileData.email, 'Updated');
      
      setMessage({ type: 'success', text: 'Profile updated successfully! Check your email for confirmation.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: `Failed to update profile. Please try again. Error: ${errorMessage}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    
    if (passwords.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long!' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(profileData.email, 'reset-token-' + Date.now());
      
      setMessage({ type: 'success', text: 'Password updated successfully! Check your email for confirmation.' });
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: `Failed to update password. Please try again. Error: ${errorMessage}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format: 'pdf' | 'docx' | 'txt' | 'html' = 'pdf') => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const exportData = {
        profile: profileData,
        settings: {
          theme: 'auto',
          notifications: true,
          privacy: 'public'
        },
        timestamp: new Date().toISOString()
      };

      await exportService.exportDocument({
        format: format,
        content: JSON.stringify(exportData, null, 2),
        filename: `account-data-${Date.now()}.${format}`
      });
      
      setMessage({ type: 'success', text: `Account data exported as ${format.toUpperCase()} successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: `Failed to export data: ${errorMessage}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? You can reactivate it later.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Account deactivated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Account deleted permanently!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/settings" className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${
                  isDark ? 'bg-indigo-600' : 'bg-indigo-100'
                }`}>
                  <User className={`w-5 h-5 ${
                    isDark ? 'text-white' : 'text-indigo-600'
                  }`} />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Settings
                  </h1>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Manage your account and security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Notification */}
      {message.text && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`flex items-center px-4 py-3 rounded-2xl shadow-lg ${
            message.type === 'success'
              ? isDark 
                ? 'bg-green-900 border border-green-800 text-green-100'
                : 'bg-green-50 border border-green-200 text-green-800'
              : isDark
                ? 'bg-red-900 border border-red-800 text-red-100'
                : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Profile Information */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <User className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Profile Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-green-600' : 'bg-green-100'
              }`}>
                <Shield className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-green-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Security</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 pr-12 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 pr-12 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 pr-12 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handlePasswordUpdate}
                disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-purple-600' : 'bg-purple-100'
              }`}>
                <Key className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-purple-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Two-Factor Authentication</h2>
            </div>
            
            <div className="space-y-4">
              <p className={`${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>SMS Authentication</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Receive codes via text message</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Enable
                </button>
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Authenticator App</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Use apps like Google Authenticator</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-red-600' : 'bg-red-100'
              }`}>
                <Mail className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-red-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Account Actions</h2>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleExportData('pdf')}
                disabled={isLoading}
                className={`w-full text-left p-4 border rounded-xl transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Export Data</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Download all your data</p>
                  </div>
                  <Download className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
              </button>
              
              <button 
                onClick={handleDeactivateAccount}
                disabled={isLoading}
                className={`w-full text-left p-4 border rounded-xl transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Deactivate Account</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Temporarily disable your account</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className={`w-full text-left p-4 border rounded-xl transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'border-red-600 hover:bg-red-900/20' 
                    : 'border-red-200 hover:bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`}>Delete Account</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-red-300' : 'text-red-500'
                    }`}>Permanently delete your account</p>
                  </div>
                  <Trash2 className={`w-5 h-5 ${
                    isDark ? 'text-red-400' : 'text-red-400'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
