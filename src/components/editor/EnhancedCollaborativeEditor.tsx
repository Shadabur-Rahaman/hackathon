'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { Copy, Mail, Link, Twitter, Slack, Facebook } from 'lucide-react';
import Avatar from 'boring-avatars';

interface SharePanelProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export default function EnhancedSharePanel({
  documentId,
  documentTitle,
  onClose
}: SharePanelProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'invite' | 'link' | 'social'>('invite');
  const [emailList, setEmailList] = useState<string[]>(['']);
  const [role, setRole] = useState<'viewer' | 'editor'>('editor');
  const [shareLink, setShareLink] = useState('');
  const [inviting, setInviting] = useState(false);

  // Generate share link
  const generateShareLink = async (permission: 'viewer' | 'editor') => {
    try {
      const response = await fetch('/api/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          permission,
          expiresIn: '7d'
        })
      });

      const { shareUrl } = await response.json();
      setShareLink(shareUrl);
      return shareUrl;
    } catch (error) {
      toast.error('Failed to generate share link');
      return null;
    }
  };

  const handleEmailInvite = async () => {
    if (!user) {
      toast.error('Please sign in to send invitations');
      return;
    }

    const validEmails = emailList.filter(email => 
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    );

    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch('/api/invite/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          documentTitle,
          emails: validEmails,
          role,
          inviterName: user.firstName + ' ' + (user.lastName || '')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✨ Invitations sent to ${validEmails.length} recipients!`);
        setEmailList(['']);
      } else {
        toast.error(result.error || 'Failed to send invitations');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out this collaborative document: "${documentTitle}"`;
    const url = shareLink || window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      slack: `slack://open?team=YOUR_TEAM_ID&id=YOUR_CHANNEL_ID&message=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  const addEmailInput = () => {
    setEmailList([...emailList, '']);
  };

  const updateEmail = (index: number, value: string) => {
    const newList = [...emailList];
    newList[index] = value;
    setEmailList(newList);
  };

  const removeEmail = (index: number) => {
    setEmailList(emailList.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Share "{documentTitle}"
        </h3>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'invite', label: 'Email Invite', icon: Mail },
          { id: 'link', label: 'Share Link', icon: Link },
          { id: 'social', label: 'Social', icon: Twitter }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium
                      ${activeTab === id
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'invite' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invite people via email
              </label>
              
              {emailList.map((email, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  {emailList.length > 1 && (
                    <button
                      onClick={() => removeEmail(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addEmailInput}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Add another email
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permission level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="viewer">Can view - View and comment only</option>
                <option value="editor">Can edit - View, comment, and edit</option>
              </select>
            </div>

            <button
              onClick={handleEmailInvite}
              disabled={inviting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                        bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                        disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              <span>{inviting ? 'Sending...' : 'Send Invitations'}</span>
            </button>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generate shareable link
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateShareLink('viewer')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Only
                </button>
                <button
                  onClick={() => generateShareLink('editor')}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Can Edit
                </button>
              </div>
            </div>

            {shareLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share this link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 
                              rounded-lg text-gray-700 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>⚠️ Security Notice:</strong> Anyone with this link will be able to access your document. 
                Links expire in 7 days by default.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this document on social platforms
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center space-x-2 px-4 py-3 
                          bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </button>

              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center space-x-2 px-4 py-3 
                          bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center space-x-2 px-4 py-3 
                          bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                <Link className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => shareToSocial('slack')}
                className="flex items-center justify-center space-x-2 px-4 py-3 
                          bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Slack className="w-4 h-4" />
                <span>Slack</span>
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                          border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Current Page Link</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
