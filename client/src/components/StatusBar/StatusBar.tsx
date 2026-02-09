import { useMemo } from 'react';

interface StatusBarProps {
  content: string;
}

export function StatusBar({ content }: StatusBarProps) {
  const stats = useMemo(() => {
    const text = content.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 238));
    return { words, chars, readingMinutes };
  }, [content]);

  return (
    <div className="status-bar">
      <span>{stats.words.toLocaleString()} words</span>
      <span className="status-sep" />
      <span>{stats.chars.toLocaleString()} chars</span>
      <span className="status-sep" />
      <span>{stats.readingMinutes} min read</span>
    </div>
  );
}
