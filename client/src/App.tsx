import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from './components/Editor/Editor';
import { Preview } from './components/Preview/Preview';
import { DiffView } from './components/DiffView/DiffView';
import { ChatPanel } from './components/Chat/ChatPanel';
import { Toolbar } from './components/Toolbar/Toolbar';
import { SectionList } from './components/SectionList/SectionList';
import { EditTargetBuilder } from './components/EditBuilder/EditTargetBuilder';
import { StatusBar } from './components/StatusBar/StatusBar';
import { useVersionHistory } from './hooks/useVersionHistory';
import { useAIEdit } from './hooks/useAIEdit';
import { useSections } from './hooks/useSections';
import { hashContent } from './utils/hash';
import type { ViewMode, EditLevel, EditTarget, ModelId } from './types';

const STORAGE_KEY = 'essayEditor:content';
const THEME_KEY = 'essayEditor:theme';

const INITIAL_CONTENT = `# My Essay

Write your essay here. Use **Markdown** formatting.

## Introduction

Start with your main idea...

## Body

Develop your arguments...

## Conclusion

Wrap up your thoughts...
`;

function loadSavedContent(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || INITIAL_CONTENT;
  } catch {
    return INITIAL_CONTENT;
  }
}

function loadTheme(): 'light' | 'dark' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [content, setContent] = useState(loadSavedContent);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [editLevel, setEditLevel] = useState<EditLevel>('whole');
  const [pendingEdit, setPendingEdit] = useState<string | null>(null);
  const [browsingVersionId, setBrowsingVersionId] = useState<string | null>(null);
  const [browsingVersionContent, setBrowsingVersionContent] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [editTargets, setEditTargets] = useState<EditTarget[]>([]);
  const [overallInstruction, setOverallInstruction] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState<ModelId>('sonnet');

  const [currentHash, setCurrentHash] = useState('');

  const selectionRef = useRef<{ from: number; to: number; text: string }>({
    from: 0,
    to: 0,
    text: '',
  });

  // Persist content to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, content); } catch { /* quota exceeded */ }
  }, [content]);

  // Recompute content hash whenever content changes
  useEffect(() => {
    hashContent(content).then(setCurrentHash);
  }, [content]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* noop */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const { versions, addVersion, getVersion, clearVersions } = useVersionHistory();
  const { sections, selectedSectionIds, selectedSections, toggleSection, clearSelectedSections, setActiveSectionByLine } =
    useSections(content);

  // AI always returns the full document now — no more splicing
  const handleEditComplete = useCallback(
    (result: string) => {
      setPendingEdit(result);
      setViewMode('diff');
    },
    []
  );

  const { messages, isStreaming, sendEdit, cancelEdit, clearMessages } = useAIEdit({
    onEditComplete: handleEditComplete,
  });

  // --- Edit target management ---

  const handleToggleSection = useCallback(
    (sectionId: string) => {
      toggleSection(sectionId);
      setEditTargets(prev => {
        const existing = prev.find(t => t.sectionId === sectionId);
        if (existing) {
          return prev.filter(t => t.sectionId !== sectionId);
        }
        const section = sections.find(s => s.id === sectionId);
        if (!section) return prev;
        return [...prev, {
          id: crypto.randomUUID(),
          type: 'section' as const,
          label: section.title,
          content: section.content,
          instruction: '',
          sectionId: section.id,
        }];
      });
    },
    [sections, toggleSection]
  );

  const handleAddSelection = useCallback(() => {
    const { from, to, text } = selectionRef.current;
    if (!text) return;
    const preview = text.length > 40
      ? text.slice(0, 40).replace(/\n/g, ' ') + '...'
      : text.replace(/\n/g, ' ');
    setEditTargets(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'selection' as const,
      label: `"${preview}"`,
      content: text,
      instruction: '',
      from,
      to,
    }]);
  }, []);

  const handleRemoveTarget = useCallback((id: string) => {
    setEditTargets(prev => {
      const target = prev.find(t => t.id === id);
      if (target?.sectionId) {
        toggleSection(target.sectionId);
      }
      return prev.filter(t => t.id !== id);
    });
  }, [toggleSection]);

  const handleUpdateTargetInstruction = useCallback((id: string, instruction: string) => {
    setEditTargets(prev =>
      prev.map(t => t.id === id ? { ...t, instruction } : t)
    );
  }, []);

  // --- Send handlers ---

  // Whole / chat mode: single instruction from ChatPanel
  const handleSendInstruction = useCallback(
    (instruction: string) => {
      const isChat = editLevel === 'chat';
      sendEdit({
        fullContent: content,
        editLevel: isChat ? 'whole' : 'whole',
        model,
        mode: isChat ? 'chat' : 'edit',
        instruction,
      });
    },
    [content, model, editLevel, sendEdit]
  );

  // Section/selection mode: multi-target from EditTargetBuilder
  const handleSendTargets = useCallback(() => {
    if (editTargets.length === 0 || !overallInstruction.trim()) return;
    sendEdit({
      fullContent: content,
      editLevel,
      model,
      mode: 'edit',
      instruction: overallInstruction.trim(),
      targets: editTargets,
    });
  }, [content, editLevel, model, editTargets, overallInstruction, sendEdit]);

  const handleAcceptEdit = useCallback(() => {
    if (!pendingEdit) return;
    setContent(pendingEdit);
    setPendingEdit(null);
    setBrowsingVersionId(null);
    setBrowsingVersionContent(null);
    setEditTargets([]);
    setOverallInstruction('');
    clearSelectedSections();
    setViewMode('editor');
  }, [pendingEdit, clearSelectedSections]);

  const handleRejectEdit = useCallback(() => {
    setPendingEdit(null);
    setBrowsingVersionId(null);
    setBrowsingVersionContent(null);
    setViewMode('editor');
  }, []);

  // Save current content as a version (deduped against latest)
  const handleSaveVersion = useCallback(() => {
    addVersion(content);
  }, [content, addVersion]);

  // Click a version in the history panel — fetch its content and show diff
  const handleVersionSelect = useCallback(
    async (id: string) => {
      const version = await getVersion(id);
      if (version) {
        setBrowsingVersionId(id);
        setBrowsingVersionContent(version.content);
        setPendingEdit(null);
        setViewMode('diff');
      }
    },
    [getVersion]
  );

  // Restore a version — fetch content and replace current
  const handleVersionRestore = useCallback(
    async (id: string) => {
      const version = await getVersion(id);
      if (version) {
        setContent(version.content);
        setBrowsingVersionId(null);
        setBrowsingVersionContent(null);
        setPendingEdit(null);
        setViewMode('editor');
      }
    },
    [getVersion]
  );

  // Exit diff/version browsing and go back to editor
  const handleBackToEditor = useCallback(() => {
    setPendingEdit(null);
    setBrowsingVersionId(null);
    setBrowsingVersionContent(null);
  }, []);

  const handleSelectionChange = useCallback((from: number, to: number) => {
    const text = content.slice(from, to);
    selectionRef.current = { from, to, text };
    setSelectedText(text);
  }, [content]);

  const handleCursorLineChange = useCallback(
    (_line: number) => {
      // no-op — cursor tracking no longer auto-selects sections
    },
    []
  );

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Clear targets when switching edit levels
  useEffect(() => {
    setEditTargets([]);
    setOverallInstruction('');
    clearSelectedSections();
  }, [editLevel, clearSelectedSections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // Cmd+S — save version
      if (mod && e.key === 's') {
        e.preventDefault();
        addVersion(content);
      }
      // Escape — toggle sidebar
      if (e.key === 'Escape') {
        setSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, addVersion]);

  // Diff view values
  const isBrowsing = browsingVersionContent !== null;
  const diffOldValue = isBrowsing ? browsingVersionContent : content;
  const diffNewValue = isBrowsing ? content : (pendingEdit || content);

  const isMultiTargetMode = editLevel === 'section' || editLevel === 'selection';

  return (
    <div className="app">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        editLevel={editLevel}
        onEditLevelChange={setEditLevel}
        model={model}
        onModelChange={setModel}
        versions={versions}
        activeVersionId={browsingVersionId}
        currentHash={currentHash}
        sidebarOpen={sidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onVersionSelect={handleVersionSelect}
        onVersionRestore={handleVersionRestore}
        onSaveVersion={handleSaveVersion}
        onClearVersions={clearVersions}
        onBackToEditor={handleBackToEditor}
      />
      <div className="app-body">
        {editLevel === 'section' && viewMode === 'editor' && (
          <div style={{ width: 240, borderRight: '1px solid var(--border-light)', overflow: 'auto', background: 'var(--bg-secondary)' }}>
            <div style={{ padding: '18px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', borderBottom: '1px solid var(--border-light)' }}>
              Sections
            </div>
            <SectionList
              sections={sections}
              selectedSectionIds={selectedSectionIds}
              onToggleSection={handleToggleSection}
            />
          </div>
        )}
        <div className="content-area">
          {viewMode === 'editor' && (
            <Editor
              content={content}
              onChange={handleContentChange}
              onSelectionChange={handleSelectionChange}
              onCursorLineChange={handleCursorLineChange}
            />
          )}
          {viewMode === 'preview' && <Preview content={content} />}
          {viewMode === 'diff' && (
            <DiffView
              oldValue={diffOldValue}
              newValue={diffNewValue}
              leftTitle={isBrowsing ? 'Saved Version' : 'Current'}
              rightTitle={isBrowsing ? 'Current' : 'Proposed'}
              onAccept={isBrowsing ? () => handleVersionRestore(browsingVersionId!) : handleAcceptEdit}
              onReject={handleRejectEdit}
              acceptLabel={isBrowsing ? 'Restore This Version' : 'Accept Changes'}
              rejectLabel="Back"
            />
          )}
          <StatusBar content={content} />
        </div>
        {sidebarOpen && <div className="right-panel">
          {isMultiTargetMode && (
            <EditTargetBuilder
              editLevel={editLevel}
              targets={editTargets}
              overallInstruction={overallInstruction}
              hasSelection={!!selectedText}
              isStreaming={isStreaming}
              onOverallInstructionChange={setOverallInstruction}
              onUpdateInstruction={handleUpdateTargetInstruction}
              onRemoveTarget={handleRemoveTarget}
              onAddSelection={handleAddSelection}
              onSend={handleSendTargets}
            />
          )}
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            editLevel={editLevel}
            showInput={!isMultiTargetMode}
            onSend={handleSendInstruction}
            onCancel={cancelEdit}
            onClear={clearMessages}
          />
        </div>}
      </div>
    </div>
  );
}
