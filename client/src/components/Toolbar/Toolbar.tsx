import { useState, useRef, useEffect } from 'react';
import type { ViewMode, EditLevel, ModelId, Version } from '../../types';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  editLevel: EditLevel;
  onEditLevelChange: (level: EditLevel) => void;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  versions: Version[];
  activeVersionId: string | null;
  currentHash: string;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onVersionSelect: (id: string) => void;
  onVersionRestore: (id: string) => void;
  onSaveVersion: () => void;
  onClearVersions: () => void;
  onBackToEditor: () => void;
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginRight: 6,
};

export function Toolbar({
  viewMode,
  onViewModeChange,
  editLevel,
  onEditLevelChange,
  model,
  onModelChange,
  versions,
  activeVersionId,
  currentHash,
  sidebarOpen,
  theme,
  onToggleTheme,
  onToggleSidebar,
  onVersionSelect,
  onVersionRestore,
  onSaveVersion,
  onClearVersions,
  onBackToEditor,
}: ToolbarProps) {
  const [showVersions, setShowVersions] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!showVersions) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowVersions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showVersions]);

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`btn ${viewMode === 'editor' ? 'active' : ''}`}
          onClick={() => {
            onBackToEditor();
            onViewModeChange('editor');
          }}
        >
          Edit
        </button>
        <button
          className={`btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => onViewModeChange('preview')}
        >
          Preview
        </button>
        {viewMode === 'diff' && (
          <button className="btn active">Diff</button>
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span style={labelStyle}>Scope</span>
        <select
          className="select"
          value={editLevel}
          onChange={e => onEditLevelChange(e.target.value as EditLevel)}
        >
          <option value="chat">Chat</option>
          <option value="whole">Whole Document</option>
          <option value="section">Section</option>
          <option value="selection">Selection</option>
        </select>
      </div>

      <div className="toolbar-group">
        <span style={labelStyle}>Model</span>
        <select
          className="select"
          value={model}
          onChange={e => onModelChange(e.target.value as ModelId)}
        >
          <option value="sonnet">Sonnet</option>
          <option value="opus">Opus</option>
          <option value="haiku">Haiku</option>
        </select>
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button className="btn" onClick={onSaveVersion}>
          Save Version
        </button>
      </div>

      <div className="toolbar-group" style={{ position: 'relative' }} ref={panelRef}>
        <button
          className={`btn ${showVersions ? 'active' : ''}`}
          onClick={() => setShowVersions(prev => !prev)}
        >
          History
          {versions.length > 0 && (
            <span className="version-badge">{versions.length}</span>
          )}
        </button>

        {showVersions && (
          <div className="version-panel">
            <div className="version-panel-header">
              <span>Saved Versions</span>
              {versions.length > 0 && (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    onClearVersions();
                    setShowVersions(false);
                  }}
                  style={{ color: 'var(--red)' }}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="version-panel-list">
              {versions.length === 0 ? (
                <div className="version-empty">
                  No saved versions yet
                </div>
              ) : (
                [...versions].reverse().map(v => {
                  const isCurrent = v.hash === currentHash;
                  return (
                    <div
                      key={v.id}
                      className={`version-item ${activeVersionId === v.id ? 'active' : ''} ${isCurrent ? 'is-current' : ''}`}
                      onClick={() => {
                        if (isCurrent) return;
                        onVersionSelect(v.id);
                        setShowVersions(false);
                      }}
                    >
                      <div className="version-item-info">
                        <span className="version-item-label">
                          {v.label}
                          {isCurrent && <span className="current-badge">Current</span>}
                        </span>
                        <span className="version-item-time">
                          {new Date(v.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="version-item-actions">
                        {!isCurrent && (
                          <button
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVersionRestore(v.id);
                              setShowVersions(false);
                            }}
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-group">
        <button
          className="btn btn-sidebar-toggle"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button
          className={`btn btn-sidebar-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Hide AI Assistant (Esc)' : 'Show AI Assistant (Esc)'}
        >
          {sidebarOpen ? 'Hide AI' : 'Show AI'}
        </button>
      </div>
    </div>
  );
}
