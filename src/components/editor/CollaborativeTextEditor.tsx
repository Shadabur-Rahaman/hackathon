'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import Avatar from 'boring-avatars';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: any;
  lastSeen: Date;
}

interface CollaborativeEditorProps {
  documentId: string;
  onSave: (content: any) => void;
  readOnly?: boolean;
}

export default function CollaborativeTextEditor({
  documentId,
  onSave,
  readOnly = false
}: CollaborativeEditorProps) {
  const { user } = useUser();
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // Generate consistent user color
  const getUserColor = (userId: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7F50'];
    return colors[userId.charCodeAt(0) % colors.length];
  };

  const userColor = user ? getUserColor(user.id) : '#999999';

  // Initialize Yjs and WebSocket provider
  useEffect(() => {
    if (!user || !documentId) return;

    // IndexedDB persistence for offline support
    const persistence = new IndexeddbPersistence(documentId, ydoc);
    
    // WebSocket provider for real-time sync
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || 'ws://localhost:1234',
      documentId,
      ydoc
    );
    setProvider(wsProvider);

    // Handle connection status
    wsProvider.on('status', ({ status }: any) => {
      console.log('WebSocket status:', status);
    });

    // Track collaborators
    wsProvider.awareness.on('change', () => {
      const states = Array.from(wsProvider.awareness.getStates().values());
      const activeCollabs = states
        .filter((state: any) => state.user && state.user.id !== user.id)
        .map((state: any) => ({
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          color: state.user.color,
          cursor: state.cursor,
          lastSeen: new Date()
        }));
      setCollaborators(activeCollabs);
    });

    // Set user info for collaboration
    wsProvider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.firstName + ' ' + (user.lastName || ''),
      email: user.emailAddresses[0]?.emailAddress,
      color: userColor
    });

    return () => {
      wsProvider.destroy();
      persistence.destroy();
      ydoc.destroy();
    };
  }, [user, documentId, userColor]);

  // TipTap editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
        field: 'content'
      }),
      CollaborationCursor.configure({
        provider,
        user: user ? {
          id: user.id,
          name: user.firstName + ' ' + (user.lastName || ''),
          color: userColor
        } : undefined
      })
    ],
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Auto-save every 2 seconds
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const content = editor.getJSON();
        onSave(content);
      }, 2000);
    }
  });

  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Version control functions
  const createVersion = useCallback(async (message: string) => {
    if (!editor) return;
    
    const content = editor.getJSON();
    const version = {
      id: Date.now().toString(),
      content,
      message,
      author: user?.firstName + ' ' + (user?.lastName || ''),
      timestamp: new Date(),
      hash: btoa(JSON.stringify(content)).slice(0, 8)
    };

    // Save to your database
    await fetch('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, version })
    });

    setVersions(prev => [version, ...prev]);
  }, [editor, user, documentId]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Collaborators Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {user && (
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
              <Avatar
                size={24}
                name={user.firstName + ' ' + (user.lastName || '')}
                variant="marble"
                colors={[userColor]}
              />
              <span className="text-sm font-medium">You</span>
            </div>
          )}
          
          {collaborators.map((collab) => (
            <div 
              key={collab.id}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
              title={`${collab.name} • Active ${formatDistanceToNow(collab.lastSeen)} ago`}
            >
              <Avatar
                size={24}
                name={collab.name}
                variant="beam"
                colors={[collab.color]}
              />
              <span className="text-sm">{collab.name.split(' ')[0]}</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => createVersion('Manual save')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={readOnly}
          >
            💾 Save Version
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <EditorContent 
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none min-h-[600px] dark:prose-invert"
          />
        </div>
      </div>
    </div>
  );
}
