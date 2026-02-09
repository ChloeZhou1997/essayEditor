import { useState, useCallback, useEffect } from 'react';
import type { Version } from '../types';

export function useVersionHistory() {
  const [versions, setVersions] = useState<Version[]>([]);

  // Load versions from server on mount
  useEffect(() => {
    fetch('/api/versions')
      .then(res => res.json())
      .then(data => setVersions(data))
      .catch(() => {});
  }, []);

  const addVersion = useCallback(async (content: string) => {
    const res = await fetch('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.duplicate) return;
    setVersions(prev => [...prev, { id: data.id, label: data.label, timestamp: data.timestamp, hash: data.hash, content: '' }]);
  }, []);

  const getVersion = useCallback(
    async (id: string): Promise<Version | null> => {
      const meta = versions.find(v => v.id === id);
      if (!meta) return null;
      const res = await fetch(`/api/versions/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return { ...meta, content: data.content };
    },
    [versions]
  );

  const clearVersions = useCallback(async () => {
    await fetch('/api/versions', { method: 'DELETE' });
    setVersions([]);
  }, []);

  return { versions, addVersion, getVersion, clearVersions };
}
