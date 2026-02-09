import { useState, useCallback, useRef } from 'react';
import { streamEdit } from '../services/api';
import type { EditRequest, ChatMessage } from '../types';

interface UseAIEditOptions {
  onEditComplete: (result: string) => void;
}

export function useAIEdit({ onEditComplete }: UseAIEditOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatorRef = useRef('');

  const messagesRef = useRef<ChatMessage[]>([]);
  // Keep ref in sync with state
  messagesRef.current = messages;

  const sendEdit = useCallback(
    async (request: EditRequest) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Build a user-facing summary of the request
      const summary = request.targets
        ? `Editing ${request.targets.length} target(s): ${request.targets.map(t => t.label).join(', ')}`
        : request.instruction || '';

      // For chat mode, include prior conversation history
      const enrichedRequest = request.mode === 'chat'
        ? {
            ...request,
            history: messagesRef.current.map(m => ({ role: m.role, content: m.content })),
          }
        : request;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: summary,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsStreaming(true);
      accumulatorRef.current = '';

      const assistantId = crypto.randomUUID();

      try {
        await streamEdit(
          enrichedRequest,
          (chunk) => {
            accumulatorRef.current += chunk;
            setMessages(prev => {
              const existing = prev.find(m => m.id === assistantId);
              if (existing) {
                return prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: accumulatorRef.current }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: assistantId,
                  role: 'assistant' as const,
                  content: accumulatorRef.current,
                  timestamp: Date.now(),
                },
              ];
            });
          },
          () => {
            setIsStreaming(false);
            if (request.mode === 'edit') {
              onEditComplete(accumulatorRef.current);
            }
          },
          (error) => {
            setIsStreaming(false);
            setMessages(prev => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Error: ${error}`,
                timestamp: Date.now(),
              },
            ]);
          },
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setIsStreaming(false);
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Error: ${(err as Error).message}`,
              timestamp: Date.now(),
            },
          ]);
        }
      }
    },
    [onEditComplete]
  );

  const cancelEdit = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendEdit, cancelEdit, clearMessages };
}
