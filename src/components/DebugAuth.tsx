'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Check if profile exists
        let profile = null;
        let profileError = null;
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          profile = data;
          profileError = error;
        }

        // Test document access
        let documentTest = null;
        let documentError = null;
        if (user) {
          const { data, error } = await supabase
            .from('documents')
            .select('id, title, owner_id')
            .limit(1);
          documentTest = data;
          documentError = error;
        }

        setDebug({
          session: !!session,
          sessionError: sessionError?.message,
          user: user ? { id: user.id, email: user.email } : null,
          userError: userError?.message,
          profile,
          profileError: profileError?.message,
          documentTest,
          documentError: documentError?.message,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        setDebug({ error: error.message });
      }
    };

    checkAuth();
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded text-xs max-w-md overflow-auto max-h-96 z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug</h3>
      <pre className="whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
}
