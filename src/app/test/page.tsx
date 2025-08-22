'use client';
import React, { useState } from 'react';
import { documentApi } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

export default function TestPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreateDocument = async () => {
    if (!user) {
      setResult('No user logged in');
      return;
    }

    setLoading(true);
    try {
      const defaultOrgId = '00000000-0000-0000-0000-000000000000';
      const newDoc = await documentApi.createDocument(
        defaultOrgId,
        'Test Document',
        undefined,
        { content: 'Hello World' },
        false
      );
      setResult(`Document created successfully: ${JSON.stringify(newDoc, null, 2)}`);
    } catch (error) {
      setResult(`Error creating document: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentApi.getDocuments();
      setResult(`Documents retrieved: ${JSON.stringify(docs, null, 2)}`);
    } catch (error) {
      setResult(`Error getting documents: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="space-y-4">
        <div>
          <p>User: {user ? user.email : 'Not logged in'}</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={testCreateDocument}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Create Test Document'}
          </button>
          <button
            onClick={testGetDocuments}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Get Documents'}
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {result || 'No result yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}
