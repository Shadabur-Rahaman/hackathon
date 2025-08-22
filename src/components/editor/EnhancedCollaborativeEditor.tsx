'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import History from '@tiptap/extension-history';
import Focus from '@tiptap/extension-focus';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
import { supabase, collaborationApi, versionApi, commentApi } from '../../lib/supabase';
import EditorToolbar from './EditorToolbar';
import CommentsPanel from './CommentsPanel';
import VersionsPanel from './VersionsPanel';
import SharePanel from './SharePanel';
import ConnectionStatus from './ConnectionStatus';
import AutoSaveIndicator from './AutoSaveIndicator';
import PresenceIndicator from './PresenceIndicator';
import { toast } from 'react-hot-toast';

interface EnhancedCollaborativeEditorProps {
  documentId: string;
  initialContent: any;
  collaborators: any[];
  onContentChange: (content: any) => void;
  onSave: (content: any) => void;
}

export default function EnhancedCollaborativeEditor({
  documentId,
  initialContent,
  collaborators,
  onContentChange,
  onSave
}: EnhancedCollaborativeEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, setConnectionStatus, setLastSaved, setSaving } = useDashboardStore();
  
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [persistence, setPersistence] = useState<IndexeddbPersistence | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<any>(null);
  const lastVersionSnapshotTimeRef = useRef<Date | null>(null);

  // Initialize Y.js document and collaboration
  useEffect(() => {
    if (!user || !documentId) return;

    const doc = new Y.Doc();
    const ytext = doc.getText('content');
    
    // Set initial content
    if (initialContent && Object.keys(initialContent).length > 0) {
      ytext.delete(0, ytext.length);
      ytext.insert(0, initialContent.content || '');
    }

    // IndexedDB persistence for offline support
    const indexeddbProvider = new IndexeddbPersistence(documentId, doc);
    setPersistence(indexeddbProvider);

    // WebSocket provider for real-time collaboration
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || 'ws://localhost:1234',
      documentId,
      doc,
      {
        params: {
          token: user.id, // In production, use a proper JWT token
          doc: documentId
        }
      }
    );

    setProvider(wsProvider);
    setYdoc(doc);

    // Handle connection status
    wsProvider.on('status', ({ status }: { status: string }) => {
      if (status === 'connected') {
        setConnectionStatus('online');
        setIsOffline(false);
      } else if (status === 'disconnected') {
        setConnectionStatus('offline');
        setIsOffline(true);
      }
    });

    // Handle awareness (presence)
    wsProvider.awareness.on('change', () => {
      const states = Array.from(wsProvider.awareness.getStates().values());
      setActiveCollaborators(states.map(state => ({
        id: state.user?.id,
        name: state.user?.name,
        color: state.user?.color,
        cursor: state.cursor
      })));
    });

    // Join collaboration session
    collaborationApi.joinSession(documentId);

    return () => {
      wsProvider.destroy();
      indexeddbProvider.destroy();
      doc.destroy();
      collaborationApi.leaveSession(documentId);
    };
  }, [documentId, user]);

  // Editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // We'll use Y.js history
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'content',
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          id: user?.id || 'anonymous',
          name: user?.name || 'Anonymous',
          color: user?.color || '#ff0000',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      FontFamily,
      FontSize,
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      Gapcursor,
      History.configure({
        depth: 100,
        newGroupDelay: 500,
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      
    ],
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${
          isDark 
            ? 'prose-invert prose-gray' 
            : 'prose-gray'
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onContentChange(content);
      
      // Show typing indicator
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);

      // Auto-save after a delay
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (JSON.stringify(content) !== JSON.stringify(lastSavedContentRef.current)) {
          handleAutoSave(content);
        }
      }, 2000);
    },
  });

  // Auto-save function
  const handleAutoSave = useCallback(async (content: any) => {
    if (!editor || !user) return;

    try {
      setSaving(true);
      await onSave(content);
      lastSavedContentRef.current = content;
      setLastSaved(new Date());
      
      // Create version snapshot periodically
      const now = new Date();
      if (!lastVersionSnapshotTimeRef.current || now.getTime() - lastVersionSnapshotTimeRef.current.getTime() > 5 * 60 * 1000) { // 5 minutes
        await versionApi.createVersion(
          documentId,
          content,
          'Auto-save',
          'main'
        );
        lastVersionSnapshotTimeRef.current = now;
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed');
    } finally {
      setSaving(false);
    }
  }, [editor, user, documentId, onSave]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsData = await commentApi.getDocumentComments(documentId);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadComments();
  }, [documentId]);

  // Load versions
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const versionsData = await versionApi.getDocumentVersions(documentId);
        setVersions(versionsData);
      } catch (error) {
        console.error('Failed to load versions:', error);
      }
    };

    loadVersions();
  }, [documentId]);

  // Handle comment creation
  const handleCreateComment = async (content: string, parentId?: string, anchorFrom?: number, anchorTo?: number) => {
    try {
      const newComment = await commentApi.createComment(
        documentId,
        content,
        parentId,
        anchorFrom,
        anchorTo
      );
      setComments(prev => [...prev, newComment]);
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Handle version restore
  const handleVersionRestore = async (versionId: string) => {
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) return;

      if (editor) {
        editor.commands.setContent(version.snapshot_json);
        await versionApi.createVersion(
          documentId,
          version.snapshot_json,
          `Restored from version: ${version.message}`,
          'main'
        );
        toast.success('Version restored');
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error('Failed to restore version');
    }
  };

  // Handle branch creation
  const handleCreateBranch = async (branchName: string, fromBranch: string = 'main') => {
    try {
      await versionApi.createBranch(documentId, branchName, fromBranch);
      toast.success(`Branch '${branchName}' created`);
    } catch (error) {
      console.error('Failed to create branch:', error);
      toast.error('Failed to create branch');
    }
  };

  // Handle merge request
  const handleCreateMergeRequest = async (sourceBranch: string, targetBranch: string, title: string, description?: string) => {
    try {
      // This would integrate with the merge request API
      toast.success('Merge request created');
    } catch (error) {
      console.error('Failed to create merge request:', error);
      toast.error('Failed to create merge request');
    }
  };

  if (!editor) {
    return (
      <div className={`flex items-center justify-center h-full ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header with status and controls */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-4">
          <ConnectionStatus isOffline={isOffline} />
          <AutoSaveIndicator />
          <PresenceIndicator collaborators={activeCollaborators} />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`p-2 rounded-lg transition-colors ${
              showComments 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Comments"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowVersions(!showVersions)}
            className={`p-2 rounded-lg transition-colors ${
              showVersions 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Version History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowShare(!showShare)}
            className={`p-2 rounded-lg transition-colors ${
              showShare 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Share"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`flex-1 overflow-auto ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <EditorContent 
              editor={editor} 
              className={`min-h-[calc(100vh-200px)] ${
                isDark 
                  ? 'prose-invert prose-gray max-w-none' 
                  : 'prose-gray max-w-none'
              }`}
            />
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className={`mt-4 px-4 py-2 text-sm rounded-lg ${
                isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
              }`}>
                <span className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>You're typing...</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        {showComments && (
          <CommentsPanel
            comments={comments}
            onCreateComment={handleCreateComment}
            onClose={() => setShowComments(false)}
          />
        )}
        
        {showVersions && (
          <VersionsPanel
            versions={versions}
            onRestore={handleVersionRestore}
            onCreateBranch={handleCreateBranch}
            onCreateMergeRequest={handleCreateMergeRequest}
            onClose={() => setShowVersions(false)}
          />
        )}
        
        {showShare && (
          <SharePanel
            documentId={documentId}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    </div>
  );
}
