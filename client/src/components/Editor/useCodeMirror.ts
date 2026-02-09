import { useEffect, useRef, useCallback, useState } from 'react';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { getMarkdownExtensions } from './markdownExtensions';

interface UseCodeMirrorOptions {
  initialValue: string;
  onChange: (value: string) => void;
  onSelectionChange?: (from: number, to: number) => void;
  onCursorLineChange?: (line: number) => void;
}

export function useCodeMirror({
  initialValue,
  onChange,
  onSelectionChange,
  onCursorLineChange,
}: UseCodeMirrorOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [selectedText, setSelectedText] = useState('');

  // Store callbacks in refs to avoid re-creating the editor
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSelectionRef = useRef(onSelectionChange);
  onSelectionRef.current = onSelectionChange;
  const onCursorLineRef = useRef(onCursorLineChange);
  onCursorLineRef.current = onCursorLineChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.selectionSet) {
        const { from, to } = update.state.selection.main;
        if (from !== to) {
          const text = update.state.sliceDoc(from, to);
          setSelectedText(text);
          onSelectionRef.current?.(from, to);
        } else {
          setSelectedText('');
        }
        const line = update.state.doc.lineAt(from).number - 1;
        onCursorLineRef.current?.(line);
      }
    });

    const state = EditorState.create({
      doc: initialValue,
      extensions: [...getMarkdownExtensions(), updateListener],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only create editor once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = useCallback((value: string) => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, []);

  const getSelection = useCallback(() => {
    const view = viewRef.current;
    if (!view) return { from: 0, to: 0, text: '' };
    const { from, to } = view.state.selection.main;
    return { from, to, text: view.state.sliceDoc(from, to) };
  }, []);

  return { containerRef, viewRef, selectedText, setValue, getSelection };
}
