'use client';
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../../lib/auth-context';
import { documentApi } from '../../lib/supabase';

export default function SimplePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [title, setTitle] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! Start typing here...</p>',
    onUpdate: ({ editor }) => {
      if (currentDoc) {
        const content = editor.getHTML();
        setCurrentDoc({ ...currentDoc, content });
      }
    },
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentApi.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const createDocument = async () => {
    if (!title.trim()) return;
    
    try {
      const newDoc = await documentApi.createDocument(
        '00000000-0000-0000-0000-000000000000',
        title,
        undefined,
        { content: '<p>New document</p>' },
        false
      );
      setDocuments([newDoc, ...documents]);
      setTitle('');
      alert('Document created successfully!');
    } catch (error) {
      console.error('Error creating document:', error);
      alert(`Error: ${error}`);
    }
  };

  const saveDocument = async () => {
    if (!currentDoc || !editor) return;
    
    try {
      const content = editor.getHTML();
      await documentApi.updateDocument(currentDoc.id, { content });
      alert('Document saved!');
    } catch (error) {
      console.error('Error saving document:', error);
      alert(`Error saving: ${error}`);
    }
  };

  const openDocument = (doc: any) => {
    setCurrentDoc(doc);
    if (editor) {
      editor.commands.setContent(doc.content || '<p>Empty document</p>');
    }
  };

  if (!user) {
    return <div className="p-8">Please log in first</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Simple Document Editor</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          
          {/* Create New Document */}
          <div className="mb-6 p-4 border rounded-lg">
            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={createDocument}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Create Document
            </button>
          </div>

          {/* Document List */}
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => openDocument(doc)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  currentDoc?.id === doc.id ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {currentDoc ? currentDoc.title : 'No document selected'}
            </h2>
            {currentDoc && (
              <button
                onClick={saveDocument}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            )}
          </div>
          
          <div className="border rounded-lg p-4 min-h-[500px]">
            {currentDoc ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="text-gray-500 text-center py-20">
                Select a document to start editing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
