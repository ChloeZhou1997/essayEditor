import { useMemo, useState, useCallback } from 'react';
import { parseSections } from '../utils/markdownParser';
import type { Section } from '../types';

export function useSections(content: string) {
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  const sections = useMemo(() => parseSections(content), [content]);

  const selectedSections = useMemo(
    () => sections.filter(s => selectedSectionIds.includes(s.id)),
    [sections, selectedSectionIds]
  );

  const toggleSection = useCallback((id: string) => {
    setSelectedSectionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelectedSections = useCallback(() => {
    setSelectedSectionIds([]);
  }, []);

  // Still useful for cursor-based highlighting in the section list
  const setActiveSectionByLine = useCallback(
    (line: number) => {
      // no-op now — cursor tracking doesn't auto-select sections
    },
    []
  );

  return {
    sections,
    selectedSectionIds,
    selectedSections,
    toggleSection,
    clearSelectedSections,
    setActiveSectionByLine,
  };
}
