'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { ArrowLeft, Save, Users, History, Share2 } from 'lucide-react';
import CollaborativeTextEditor from '@/components/editor/CollaborativeTextEditor';
import { documentApi } from '@/lib/supabase';
import { useTheme } from '@/lib/theme-context';

export default function DocumentEditPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    const loadDocument = async () => {
      if (!userId) return;

      try {
        const doc = await documentApi.getDocument(params.id);
        if (!doc) {
          setError('Document not found');
          return;
        }

        // Check permissions
        if (doc.owner_id !== userId && !doc.is_public) {
          setError('You do not have permission to edit this document');
          return;
        }

        setDocument(doc);
      } catch (e) {
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadDocument();
  }, [userId, params.id]);

  const handleSave = async (content: any) => {
    if (!document) return;
    
    await documentApi.updateDocument(document.id, {
      content,
      updated_at: new Date().toISOString()
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {document?.title || 'Untitled Document'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Editing • Auto-saved
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm">
              <Users className="w-4 h-4" />
              <span>3 online</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <CollaborativeTextEditor
        documentId={params.id}
        onSave={handleSave}
        readOnly={false}
      />
    </div>
  );
}
