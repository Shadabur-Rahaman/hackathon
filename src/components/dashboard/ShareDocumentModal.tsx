'use client';

import React, { useState } from 'react';
import { useTheme } from '../../lib/theme-context';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteDocumentModalProps {
  document: any;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteDocumentModal({ document, onDelete, onClose }: DeleteDocumentModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md mx-4`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Delete Document
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
            Are you sure you want to delete <strong>"{document.title}"</strong>? 
            This action cannot be undone and all document data will be permanently removed.
          </p>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-medium text-sm ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                  This will permanently delete:
                </h4>
                <ul className={`mt-2 text-sm list-disc list-inside space-y-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  <li>The document content</li>
                  <li>All version history</li>
                  <li>Comments and discussions</li>
                  <li>Sharing permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            disabled={deleting}
            className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{deleting ? 'Deleting...' : 'Delete Document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
