'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Eye, EyeOff, Download, Link as LinkIcon, Clock, Bell, CheckCircle, Lock, Globe, Save } from 'lucide-react';
import { useTheme } from '../../../lib/theme-context';
import Toggle from '../../../components/Toggle';
import Select from '../../../components/Select';

interface CollaborationSettings {
  defaultPrivacy: 'private' | 'team' | 'public';
  defaultPermissions: 'view' | 'comment' | 'edit';
  autoSave: boolean;
  invitationExpiry: '1' | '7' | '30' | '90';
  emailNotifications: boolean;
  approvalRequired: boolean;
  publicLinks: boolean;
  passwordProtection: boolean;
  downloadRestrictions: boolean;
  liveCursors: boolean;
  typingIndicators: boolean;
  autoResolveConflicts: boolean;
  versionHistory: boolean;
}

export default function CollaborationSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [settings, setSettings] = useState<CollaborationSettings>({
    defaultPrivacy: 'private',
    defaultPermissions: 'view',
    autoSave: true,
    invitationExpiry: '1',
    emailNotifications: true,
    approvalRequired: false,
    publicLinks: false,
    passwordProtection: false,
    downloadRestrictions: false,
    liveCursors: true,
    typingIndicators: true,
    autoResolveConflicts: true,
    versionHistory: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const updateSetting = (key: keyof CollaborationSettings, value: CollaborationSettings[keyof CollaborationSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Collaboration settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const privacyOptions = [
    { value: 'private', label: 'Private - Only you' },
    { value: 'team', label: 'Team - Members only' },
    { value: 'public', label: 'Public - Anyone with link' }
  ];

  const permissionOptions = [
    { value: 'view', label: 'View only' },
    { value: 'comment', label: 'Can comment' },
    { value: 'edit', label: 'Can edit' }
  ];

  const expiryOptions = [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' }
  ];

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
                  <Users className={`w-5 h-5 ${
                    isDark ? 'text-white' : 'text-indigo-600'
                  }`} />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Collaboration Settings
                  </h1>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Manage team permissions and sharing
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasChanges 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg' 
                  : isDark 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </button>
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
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Default Permissions */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <Shield className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Default Permissions</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Document Privacy
                </label>
                <Select
                  value={settings.defaultPrivacy}
                  onChange={(value) => updateSetting('defaultPrivacy', value)}
                  options={privacyOptions}
                  isDark={isDark}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Default Editor Permissions
                </label>
                <Select
                  value={settings.defaultPermissions}
                  onChange={(value) => updateSetting('defaultPermissions', value)}
                  options={permissionOptions}
                  isDark={isDark}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Auto-save
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Save changes automatically
                  </p>
                </div>
                <Toggle
                  checked={settings.autoSave}
                  onChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-green-600' : 'bg-green-100'
              }`}>
                <Users className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-green-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Team Management</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Invitation Expiry
                </label>
                <Select
                  value={settings.invitationExpiry}
                  onChange={(value) => updateSetting('invitationExpiry', value)}
                  options={expiryOptions}
                  isDark={isDark}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Notifications
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Notify when someone joins
                  </p>
                </div>
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Approval Required
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Approve new team members
                  </p>
                </div>
                <Toggle
                  checked={settings.approvalRequired}
                  onChange={(checked) => updateSetting('approvalRequired', checked)}
                />
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-purple-600' : 'bg-purple-100'
              }`}>
                <LinkIcon className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-purple-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Sharing Options</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Public Links
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Allow sharing via public URLs
                  </p>
                </div>
                <Toggle
                  checked={settings.publicLinks}
                  onChange={(checked) => updateSetting('publicLinks', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password Protection
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Require password for access
                  </p>
                </div>
                <Toggle
                  checked={settings.passwordProtection}
                  onChange={(checked) => updateSetting('passwordProtection', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Download Restrictions
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Prevent file downloads
                  </p>
                </div>
                <Toggle
                  checked={settings.downloadRestrictions}
                  onChange={(checked) => updateSetting('downloadRestrictions', checked)}
                />
              </div>
            </div>
          </div>

          {/* Real-time Features */}
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-orange-600' : 'bg-orange-100'
              }`}>
                <Globe className={`w-5 h-5 ${
                  isDark ? 'text-white' : 'text-orange-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Real-time Features</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Live Cursors
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Show other users' cursors
                  </p>
                </div>
                <Toggle
                  checked={settings.liveCursors}
                  onChange={(checked) => updateSetting('liveCursors', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Typing Indicators
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Show when someone is typing
                  </p>
                </div>
                <Toggle
                  checked={settings.typingIndicators}
                  onChange={(checked) => updateSetting('typingIndicators', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Conflict Resolution
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Auto-resolve editing conflicts
                  </p>
                </div>
                <Toggle
                  checked={settings.autoResolveConflicts}
                  onChange={(checked) => updateSetting('autoResolveConflicts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Version History
                  </label>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Track document changes
                  </p>
                </div>
                <Toggle
                  checked={settings.versionHistory}
                  onChange={(checked) => updateSetting('versionHistory', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
