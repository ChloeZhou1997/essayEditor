interface EditTarget {
  type: 'section' | 'selection';
  label: string;
  content: string;
  instruction: string;
}

interface PromptOptions {
  fullContent: string;
  editLevel: 'whole' | 'section' | 'selection';
  instruction?: string;
  targets?: EditTarget[];
}

export function buildPrompt({ fullContent, editLevel, instruction, targets }: PromptOptions): string {
  const base = `You are an expert essay editor. Apply the editing instructions and return ONLY the complete edited document. Do not include explanations, markdown code fences, or any other commentary — output the raw edited document only.`;

  // Whole mode: single instruction
  if (editLevel === 'whole' || !targets || targets.length === 0) {
    return `${base}

Here is the full document:

${fullContent}

Instruction: ${instruction}

Return the complete edited document:`;
  }

  // Multi-target mode: overall instruction + per-target specifics
  const targetList = targets.map((t, i) => {
    const typeLabel = t.type === 'section' ? `Section "${t.label}"` : `Selected text: ${t.label}`;
    const preview = t.content.length > 200
      ? t.content.slice(0, 200) + '...'
      : t.content;
    const perTarget = t.instruction.trim()
      ? `\n   Additional instruction: ${t.instruction}`
      : '';
    return `${i + 1}. ${typeLabel}:
   > ${preview.replace(/\n/g, '\n   > ')}${perTarget}`;
  }).join('\n\n');

  return `${base}

Here is the full document:

${fullContent}

Overall instruction: ${instruction}

Apply the overall instruction to each of the following targets. If a target has an additional instruction, apply that as well:

${targetList}

Return the complete edited document with all changes applied:`;
}

interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export function buildChatPrompt(fullContent: string, message: string, history?: ChatHistoryEntry[]): string {
  let prompt = `Here is the essay the user is working on:

---
${fullContent}
---`;

  if (history && history.length > 0) {
    prompt += '\n\nConversation so far:';
    for (const entry of history) {
      const label = entry.role === 'user' ? 'User' : 'Assistant';
      prompt += `\n\n${label}: ${entry.content}`;
    }
  }

  prompt += `\n\nUser: ${message}`;
  return prompt;
}
