import type { EditRequest } from '../types';

export async function streamEdit(
  request: EditRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    onError(`Request failed: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'chunk') {
            onChunk(event.data);
          } else if (event.type === 'done') {
            onDone();
            return;
          } else if (event.type === 'error') {
            onError(event.data);
            return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }

  onDone();
}
