import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

const zenTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  '.cm-content': {
    caretColor: 'var(--accent)',
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: '14.5px',
    lineHeight: '1.85',
    padding: '16px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--accent)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'var(--accent-light)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--accent-light)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-muted)',
    border: 'none',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--bg-surface)',
    border: 'none',
    color: 'var(--text-muted)',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  // Search panel styling
  '.cm-panels': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(107, 143, 113, 0.25)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(107, 143, 113, 0.45)',
  },
});

const markdownHighlight = HighlightStyle.define([
  // Headings — use CSS var for color so it adapts to dark mode
  { tag: tags.heading1, color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.4em' },
  { tag: tags.heading2, color: 'var(--text-primary)', fontWeight: '650', fontSize: '1.2em' },
  { tag: tags.heading3, color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1em' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], color: 'var(--text-secondary)', fontWeight: '600' },

  // Heading markers (the # symbols)
  { tag: tags.processingInstruction, color: 'var(--text-muted)' },

  // Emphasis
  { tag: tags.strong, color: 'var(--text-primary)', fontWeight: '700' },
  { tag: tags.emphasis, color: 'var(--accent)', fontStyle: 'italic' },

  // Code
  { tag: tags.monospace, color: '#c0885a', backgroundColor: 'rgba(192, 136, 90, 0.08)', borderRadius: '3px' },

  // Links
  { tag: tags.link, color: 'var(--accent)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--accent)' },

  // Quotes
  { tag: tags.quote, color: 'var(--text-muted)', fontStyle: 'italic' },

  // List markers
  { tag: tags.list, color: 'var(--accent)' },

  // Horizontal rules, meta
  { tag: tags.meta, color: 'var(--text-muted)' },
  { tag: tags.contentSeparator, color: 'var(--text-muted)' },

  // Strikethrough
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--text-muted)' },
]);

export function getMarkdownExtensions(): Extension[] {
  return [
    markdown({ base: markdownLanguage }),
    syntaxHighlighting(markdownHighlight),
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
    highlightSelectionMatches(),
    EditorView.lineWrapping,
    zenTheme,
  ];
}
