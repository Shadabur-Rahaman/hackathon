'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Download } from 'lucide-react';
import { useTheme } from '../../lib/theme-context';
import { exportService } from '../../lib/export-service';

export default function LiveDemo() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [content, setContent] = useState<string>('');
  const [serverUpdatedAt, setServerUpdatedAt] = useState<number>(0);
  const [activeClients, setActiveClients] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  const clientId = useMemo(() => Math.random().toString(36).slice(2), []);
  const localUpdatedAtRef = useRef<number>(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch latest content periodically
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchState = async () => {
      const res = await fetch(`/api/collab?clientId=${clientId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setActiveClients(data.activeClients ?? 1);

      if (data.updatedAt > localUpdatedAtRef.current) {
        setContent(data.content || '');
        setServerUpdatedAt(data.updatedAt);
        localUpdatedAtRef.current = data.updatedAt;
      }
    };

    fetchState();
    interval = setInterval(fetchState, 1500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clientId]);

  const scheduleSave = (next: string) => {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, content: next }),
      });
      const ts = Date.now();
      localUpdatedAtRef.current = ts;
      setServerUpdatedAt(ts);
      setSaving(false);
    }, 300);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setContent(next);
    scheduleSave(next);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <header className={`border-b ${isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0` }>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className={`p-2 rounded-md ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="font-semibold">Live Collaboration Demo</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active users: {activeClients} • {saving ? 'Saving…' : 'Synced'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportService.exportDocument({ format: 'pdf', content, filename: 'demo.pdf' })}
              className={`px-3 py-2 rounded-md text-sm inline-flex items-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => exportService.exportDocument({ format: 'docx', content, filename: 'demo.docx' })}
              className={`px-3 py-2 rounded-md text-sm inline-flex items-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <Download className="w-4 h-4" /> Export DOCX
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-50 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Shared Document</span>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last updated: {new Date(serverUpdatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={onChange}
            placeholder="Start typing..."
            className={`w-full min-h-[60vh] p-4 outline-none resize-none ${isDark ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
          />
        </div>
      </main>
    </div>
  );
}
