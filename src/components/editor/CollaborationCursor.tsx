'use client';
import React from 'react';
import type { Editor } from '@tiptap/react';
import type { Collaborator } from '../../lib/store';

interface CollaborationCursorProps {
  collaborator: Collaborator;
  editor: Editor;
}

export default function CollaborationCursor({ collaborator, editor }: CollaborationCursorProps) {
  // This is a placeholder component
  // In a real implementation, this would render the collaborator's cursor
  // at the correct position in the editor
  
  if (!collaborator.cursor) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: collaborator.cursor.x,
        top: collaborator.cursor.y,
      }}
    >
      <div
        className="w-0.5 h-5"
        style={{ backgroundColor: collaborator.color }}
      />
      <div
        className="px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.name}
      </div>
    </div>
  );
}
