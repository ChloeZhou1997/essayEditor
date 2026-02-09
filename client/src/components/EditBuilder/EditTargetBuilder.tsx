import { TargetCard } from './TargetCard';
import type { EditTarget, EditLevel } from '../../types';

interface EditTargetBuilderProps {
  editLevel: EditLevel;
  targets: EditTarget[];
  overallInstruction: string;
  hasSelection: boolean;
  isStreaming: boolean;
  onOverallInstructionChange: (instruction: string) => void;
  onUpdateInstruction: (id: string, instruction: string) => void;
  onRemoveTarget: (id: string) => void;
  onAddSelection: () => void;
  onSend: () => void;
}

export function EditTargetBuilder({
  editLevel,
  targets,
  overallInstruction,
  hasSelection,
  isStreaming,
  onOverallInstructionChange,
  onUpdateInstruction,
  onRemoveTarget,
  onAddSelection,
  onSend,
}: EditTargetBuilderProps) {
  const canSend = targets.length > 0 && overallInstruction.trim() && !isStreaming;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="edit-target-builder">
      <div className="edit-target-header">
        <span className="edit-target-title">Edit Targets</span>
        <span className="edit-target-count">{targets.length}</span>
      </div>

      <div className="edit-target-body">
        <div className="overall-instruction">
          <textarea
            className="overall-instruction-input"
            placeholder="Overall editing instruction (applies to all targets)..."
            value={overallInstruction}
            onChange={e => onOverallInstructionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isStreaming}
          />
        </div>

        <div className="edit-target-list">
          {targets.length === 0 ? (
            <div className="edit-target-empty">
              {editLevel === 'section'
                ? 'Check sections on the left to add edit targets'
                : 'Select text in the editor, then click "Add Selection"'}
            </div>
          ) : (
            targets.map(target => (
              <TargetCard
                key={target.id}
                target={target}
                onUpdateInstruction={onUpdateInstruction}
                onRemove={onRemoveTarget}
              />
            ))
          )}
        </div>
      </div>

      <div className="edit-target-actions">
        {editLevel === 'selection' && (
          <button
            className="btn"
            onClick={onAddSelection}
            disabled={!hasSelection}
          >
            + Add Selection
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={onSend}
          disabled={!canSend}
        >
          {isStreaming ? 'Editing...' : 'Send Edits'}
        </button>
      </div>
    </div>
  );
}
