import type { EditTarget } from '../../types';

interface TargetCardProps {
  target: EditTarget;
  onUpdateInstruction: (id: string, instruction: string) => void;
  onRemove: (id: string) => void;
}

export function TargetCard({ target, onUpdateInstruction, onRemove }: TargetCardProps) {
  const preview = target.content.length > 80
    ? target.content.slice(0, 80).replace(/\n/g, ' ') + '...'
    : target.content.replace(/\n/g, ' ');

  return (
    <div className="target-card">
      <div className="target-card-header">
        <span className="target-badge">{target.type === 'section' ? 'Section' : 'Selection'}</span>
        <span className="target-label">{target.label}</span>
        <button className="target-remove" onClick={() => onRemove(target.id)} title="Remove">
          &times;
        </button>
      </div>
      <div className="target-preview">{preview}</div>
      <textarea
        className="target-instruction"
        placeholder="Additional instruction for this target (optional)..."
        value={target.instruction}
        onChange={e => onUpdateInstruction(target.id, e.target.value)}
        rows={2}
      />
    </div>
  );
}
