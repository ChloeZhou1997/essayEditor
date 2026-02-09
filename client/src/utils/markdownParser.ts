import type { Section } from '../types';

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

export function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  const matches: { title: string; level: number; lineIndex: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      matches.push({
        title: match[2],
        level: match[1].length,
        lineIndex: i,
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const startLine = matches[i].lineIndex;
    const endLine = i + 1 < matches.length ? matches[i + 1].lineIndex - 1 : lines.length - 1;
    const sectionLines = lines.slice(startLine, endLine + 1);

    sections.push({
      id: `section-${i}`,
      title: matches[i].title,
      level: matches[i].level,
      startLine,
      endLine,
      content: sectionLines.join('\n'),
    });
  }

  return sections;
}

export function replaceSectionContent(
  fullContent: string,
  section: Section,
  newSectionContent: string
): string {
  const lines = fullContent.split('\n');
  const before = lines.slice(0, section.startLine);
  const after = lines.slice(section.endLine + 1);
  return [...before, newSectionContent, ...after].join('\n');
}
