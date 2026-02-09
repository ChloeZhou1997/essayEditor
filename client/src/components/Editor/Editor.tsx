import { useEffect } from 'react';
import { useCodeMirror } from './useCodeMirror';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (from: number, to: number) => void;
  onCursorLineChange?: (line: number) => void;
}

export function Editor({
  content,
  onChange,
  onSelectionChange,
  onCursorLineChange,
}: EditorProps) {
  const { containerRef, setValue } = useCodeMirror({
    initialValue: content,
    onChange,
    onSelectionChange,
    onCursorLineChange,
  });

  useEffect(() => {
    setValue(content);
  }, [content, setValue]);

  return <div ref={containerRef} className="editor-container" />;
}
