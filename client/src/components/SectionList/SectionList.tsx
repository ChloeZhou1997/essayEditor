import type { Section } from '../../types';

interface SectionListProps {
  sections: Section[];
  selectedSectionIds: string[];
  onToggleSection: (id: string) => void;
}

export function SectionList({ sections, selectedSectionIds, onToggleSection }: SectionListProps) {
  if (sections.length === 0) return null;

  return (
    <div className="section-list">
      {sections.map(section => (
        <label
          key={section.id}
          className={`section-item ${selectedSectionIds.includes(section.id) ? 'active' : ''}`}
        >
          <input
            type="checkbox"
            className="section-checkbox"
            checked={selectedSectionIds.includes(section.id)}
            onChange={() => onToggleSection(section.id)}
          />
          {Array.from({ length: section.level - 1 }).map((_, i) => (
            <span key={i} className="section-indent" />
          ))}
          <span>{section.title}</span>
        </label>
      ))}
    </div>
  );
}
