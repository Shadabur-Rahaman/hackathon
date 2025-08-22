'use client';

import React, { useState } from 'react';
import { useTheme } from '../../lib/theme-context';
import { X, AlertTriangle, Copy, Trash2, Loader2 } from 'lucide-react';

interface BulkActionsModalProps {
  action: 'delete' | 'duplicate' | null;
  documentCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BulkActionsModal({ action, documentCount, onConfirm, onClose }: BulkActionsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getActionDetails = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Delete Documents',
          icon: <Trash2 className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-100',
          message: `Are you sure you want to delete ${documentCount} document${documentCount > 1 ? 's' : ''}?`,
          warning: 'This action cannot be undone. All document data will be permanently removed.',
          confirmText: 'Delete Documents',
          confirmStyle: 'bg-red-600 hover:bg-red-700'
        };
      case 'duplicate':
        return {
          title: 'Duplicate Documents',
          icon: <Copy className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-100',
          message: `Create copies of ${documentCount} document${documentCount > 1 ? 's' : ''}?`,
          warning: 'New documents will be created with "(Copy)" added to their titles.',
          confirmText: 'Duplicate Documents',
          confirmStyle: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          title: 'Bulk Action',
          icon: <AlertTriangle className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-100',
          message: 'Perform bulk action?',
          warning: '',
          confirmText: 'Confirm',
          confirmStyle: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const actionDetails = getActionDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md mx-4`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 ${actionDetails.bgColor} rounded-full flex items-center justify-center`}>
              {actionDetails.icon}
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {actionDetails.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {actionDetails.message}
          </p>

          {actionDetails.warning && (
            <div className={`p-4 rounded-lg ${
              action === 'delete' 
                ? isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                : isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  action === 'delete' ? 'text-red-500' : 'text-blue-500'
                }`} />
                <p className={`text-sm ${
                  action === 'delete' 
                    ? isDark ? 'text-red-300' : 'text-red-700'
                    : isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {actionDetails.warning}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            disabled={processing}
            className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${actionDetails.confirmStyle}`}
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              action === 'delete' ? <Trash2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />
            )}
            <span>{processing ? 'Processing...' : actionDetails.confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
