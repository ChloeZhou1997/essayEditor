import { query } from '@anthropic-ai/claude-code';

type ModelId = 'sonnet' | 'opus' | 'haiku';

const MODEL_MAP: Record<ModelId, string> = {
  sonnet: 'claude-sonnet-4-5-20250929',
  opus: 'claude-opus-4-6',
  haiku: 'claude-haiku-4-5-20251001',
};

export async function* streamClaudeChat(prompt: string, model?: ModelId): AsyncGenerator<string> {
  const stream = query({
    prompt,
    options: {
      maxTurns: 1,
      model: MODEL_MAP[model || 'sonnet'],
      customSystemPrompt: 'You are a helpful writing assistant. The user is working on an essay and wants to discuss it with you. Answer questions, give feedback, suggest improvements, and have a natural conversation. Do NOT return a full edited document — respond conversationally.',
      permissionMode: 'bypassPermissions',
      includePartialMessages: true,
    },
  });

  for await (const message of stream) {
    if (message.type === 'stream_event') {
      const event = message.event;
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}

export async function* streamClaudeEdit(prompt: string, model?: ModelId): AsyncGenerator<string> {
  const stream = query({
    prompt,
    options: {
      maxTurns: 1,
      model: MODEL_MAP[model || 'sonnet'],
      customSystemPrompt: 'You are an essay editing assistant. Return only the edited text with no additional commentary.',
      permissionMode: 'bypassPermissions',
      includePartialMessages: true,
    },
  });

  for await (const message of stream) {
    // Stream partial text deltas for real-time streaming
    if (message.type === 'stream_event') {
      const event = message.event;
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
