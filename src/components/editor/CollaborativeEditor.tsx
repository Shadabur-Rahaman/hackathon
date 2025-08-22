'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
import { collaborationApi } from '../../lib/supabase';
import type { Collaborator } from '../../lib/store';
import EditorToolbar from './EditorToolbar';
import CollaborationCursor from './CollaborationCursor';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  collaborators: Collaborator[];
  onContentChange: (content: string) => void;
}

// Simple Y.js simulation for demo purposes
// In a real implementation, you would use actual Y.js with WebSocket provider
class SimpleCollaborationProvider {
  private documentId: string;
  private userId: string;
  private content: string;
  private listeners: ((content: string) => void)[] = [];

  constructor(documentId: string, userId: string, initialContent: string) {
    this.documentId = documentId;
    this.userId = userId;
    this.content = initialContent;
  }

  onUpdate(callback: (content: string) => void) {
    this.listeners.push(callback);
  }

  updateContent(newContent: string) {
    this.content = newContent;
    this.listeners.forEach(listener => listener(newContent));
  }

  getContent() {
    return this.content;
  }

  destroy() {
    this.listeners = [];
  }
}

export default function CollaborativeEditor({
  documentId,
  initialContent,
  collaborators,
  onContentChange
}: CollaborativeEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useDashboardStore();
  
  const [collaborationProvider, setCollaborationProvider] = useState<SimpleCollaborationProvider | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
    ],
    content: initialContent,
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
      const content = editor.getHTML();
      onContentChange(content);
      
      // Update collaboration provider
      if (collaborationProvider) {
        collaborationProvider.updateContent(content);
      }

      // Show typing indicator
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);

      // Auto-save after a delay
      setTimeout(() => {
        // This would trigger auto-save in the parent component
      }, 2000);
    },
  });

  // Initialize collaboration provider
  useEffect(() => {
    if (user && documentId) {
      const provider = new SimpleCollaborationProvider(documentId, user.id, initialContent);
      setCollaborationProvider(provider);

      // Listen for updates from other collaborators
      provider.onUpdate((content) => {
        if (editor && content !== editor.getHTML()) {
          editor.commands.setContent(content, false);
        }
      });

      return () => {
        provider.destroy();
      };
    }
  }, [documentId, user, initialContent]);

  // Update editor content when initial content changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  // Handle cursor position updates for collaboration
  const handleSelectionUpdate = () => {
    if (!editor || !user) return;

    const { from, to } = editor.state.selection;
    const cursorPosition = {
      x: 0, // This would be calculated from the actual cursor position
      y: 0,
      selection: { from, to }
    };

    // Send cursor position to other collaborators
    collaborationApi.updateCursor(documentId, user.id, cursorPosition);
  };

  useEffect(() => {
    if (editor) {
      editor.on('selectionUpdate', handleSelectionUpdate);
      return () => {
        editor.off('selectionUpdate', handleSelectionUpdate);
      };
    }
  }, [editor, user, documentId]);

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
      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      {/* Editor Content */}
      <div className={`flex-1 overflow-auto p-6 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto">
          <EditorContent 
            editor={editor} 
            className={`min-h-[calc(100vh-200px)] ${
              isDark 
                ? 'prose-invert prose-gray max-w-none' 
                : 'prose-gray max-w-none'
            }`}
          />
          
          {/* Collaboration Cursors */}
          {collaborators.map((collaborator) => (
            <CollaborationCursor
              key={collaborator.id}
              collaborator={collaborator}
              editor={editor}
            />
          ))}
        </div>
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className={`px-6 py-2 text-sm ${
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
  );
}
