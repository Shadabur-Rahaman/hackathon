'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Share2, MoreVertical, 
  MessageSquare, History, Users, Wifi, WifiOff,
  Download, Settings, Eye, EyeOff
} from 'lucide-react';
import { useTheme } from '../../../lib/theme-context';
import { useDashboardStore } from '../../../lib/store';
import { documentApi, collaborationApi, realtimeApi } from '../../../lib/supabase';
import EnhancedCollaborativeEditor from '../../../components/editor/EnhancedCollaborativeEditor';
import CommentsPanel from '../../../components/editor/CommentsPanel';
import SharePanel from '../../../components/editor/SharePanel';
import VersionsPanel from '../../../components/editor/VersionsPanel';
import PresenceIndicator from '../../../components/editor/PresenceIndicator';
import ConnectionStatus from '../../../components/editor/ConnectionStatus';
import AutoSaveIndicator from '../../../components/editor/AutoSaveIndicator';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const {
    user,
    currentDocument,
    setCurrentDocument,
    collaborators,
    setCollaborators,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorCursor,
    isConnected,
    setIsConnected,
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
    commentsPanelOpen,
    setCommentsPanelOpen,
    sharePanelOpen,
    setSharePanelOpen,
    versionsPanelOpen,
    setVersionsPanelOpen
  } = useDashboardStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const documentId = params.id as string;
  const subscriptions = useRef<any[]>([]);

  // Load document and setup collaboration
  useEffect(() => {
    const loadDocument = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Load document
        const doc = await documentApi.getDocument(documentId);
        if (!doc) {
          setError('Document not found');
          return;
        }

        // Check permissions - simplified for now
        const hasAccess = doc.owner_id === user.id || doc.is_public || true; // Allow all for testing
        
        if (!hasAccess) {
          setError('You do not have access to this document');
          return;
        }

        setCurrentDocument(doc);

        // Join collaboration session
        await collaborationApi.joinSession(documentId);
        setIsConnected(true);

        // Load active collaborators
        const activeCollaborators = await collaborationApi.getActiveCollaborators(documentId);
        setCollaborators(activeCollaborators);

        // Setup real-time subscriptions
        setupRealtimeSubscriptions();

      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();

    // Cleanup on unmount
    return () => {
      cleanupSubscriptions();
      if (user) {
        collaborationApi.leaveSession(documentId);
      }
    };
  }, [documentId, user]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to document changes
    const docSub = realtimeApi.subscribeToDocument(documentId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setCurrentDocument(prev => prev ? { ...prev, ...payload.new } : null);
      }
    });

    // Subscribe to collaboration sessions
    const collabSub = realtimeApi.subscribeToCollaboration(documentId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // New collaborator joined
        const newCollaborator = {
          id: payload.new.user_id,
          name: payload.new.profiles?.name || 'Unknown',
          avatar: payload.new.profiles?.avatar,
          color: payload.new.profiles?.color || '#6366f1'
        };
        addCollaborator(newCollaborator);
      } else if (payload.eventType === 'UPDATE' && !payload.new.active) {
        // Collaborator left
        removeCollaborator(payload.new.user_id);
      }
    });

    // Subscribe to cursor updates
    const cursorSub = realtimeApi.subscribeToCollaboration(documentId, (payload) => {
      if (payload.new?.user_id !== user?.id && payload.new?.cursor_position) {
        updateCollaboratorCursor(payload.new.user_id, payload.new.cursor_position);
      }
    });

    subscriptions.current = [docSub, collabSub, cursorSub];
  };

  const cleanupSubscriptions = () => {
    subscriptions.current.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptions.current = [];
  };

  const handleSave = async (content?: any) => {
    if (!currentDocument) return;

    setIsSaving(true);
    try {
      await documentApi.updateDocument(currentDocument.id, {
        content: content || currentDocument.content,
        last_edited_by: user?.id
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      // Show error to user
      alert(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!currentDocument) return;

    try {
      const { exportService } = await import('../../../lib/export-service');
      await exportService.exportDocument({
        format,
        content: currentDocument.content,
        filename: `${currentDocument.title}.${format}`
      });
    } catch (error) {
      console.error('Error exporting document:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentDocument?.title || 'Untitled Document'}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <ConnectionStatus isConnected={isConnected} />
                <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
                <PresenceIndicator collaborators={collaborators} />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Panel Toggles */}
            <button
              onClick={() => setCommentsPanelOpen(!commentsPanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                commentsPanelOpen
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSharePanelOpen(!sharePanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                sharePanelOpen
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setVersionsPanelOpen(!versionsPanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                versionsPanelOpen
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleExport('pdf');
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as PDF</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleExport('docx');
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as Word</span>
                    </button>
                    
                    <button
                      onClick={toggleFullscreen}
                      className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {isFullscreen ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Fullscreen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Editor */}
        <main className={`flex-1 transition-all duration-300 ${
          commentsPanelOpen || sharePanelOpen || versionsPanelOpen ? 'mr-80' : 'mr-0'
        }`}>
          <EnhancedCollaborativeEditor
            documentId={documentId}
            initialContent={currentDocument?.content || {}}
            collaborators={collaborators}
            onContentChange={(content) => {
              if (currentDocument) {
                setCurrentDocument({ ...currentDocument, content });
              }
            }}
            onSave={handleSave}
          />
        </main>

        {/* Side Panels */}
        <div className={`fixed right-0 top-20 bottom-0 w-80 transition-transform duration-300 ${
          commentsPanelOpen || sharePanelOpen || versionsPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {commentsPanelOpen && (
            <CommentsPanel documentId={documentId} />
          )}
          
          {sharePanelOpen && currentDocument && (
            <SharePanel document={currentDocument} />
          )}
          
          {versionsPanelOpen && currentDocument && (
            <VersionsPanel document={currentDocument} />
          )}
        </div>
      </div>
    </div>
  );
}
