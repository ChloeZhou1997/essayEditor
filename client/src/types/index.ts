export type ViewMode = 'editor' | 'preview' | 'diff';

export type EditLevel = 'whole' | 'section' | 'selection' | 'chat';

export interface Version {
  id: string;
  content: string;
  timestamp: number;
  label: string;
  hash: string;
}

export interface Section {
  id: string;
  title: string;
  level: number;
  startLine: number;
  endLine: number;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface EditTarget {
  id: string;
  type: 'section' | 'selection';
  label: string;
  content: string;
  instruction: string;
  sectionId?: string;
  from?: number;
  to?: number;
}

export type ModelId = 'sonnet' | 'opus' | 'haiku';

export interface EditRequest {
  fullContent: string;
  editLevel: EditLevel;
  model: ModelId;
  mode: 'edit' | 'chat';
  instruction?: string;
  targets?: EditTarget[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  data: string;
}
