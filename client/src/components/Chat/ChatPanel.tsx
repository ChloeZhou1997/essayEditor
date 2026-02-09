import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType, EditLevel } from '../../types';

interface ChatPanelProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  editLevel: EditLevel;
  showInput: boolean;
  onSend: (instruction: string) => void;
  onCancel: () => void;
  onClear: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  editLevel,
  showInput,
  onSend,
  onCancel,
  onClear,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <span>AI Assistant</span>
        {messages.length > 0 && !isStreaming && (
          <button className="btn btn-sm chat-clear-btn" onClick={onClear}>
            New Chat
          </button>
        )}
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <span>
              {showInput
                ? 'Send an instruction to edit your essay'
                : 'Add targets and instructions, then send edits'}
            </span>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="loading-indicator">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showInput && (
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an editing instruction..."
              rows={2}
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button className="chat-send-btn" onClick={onCancel}>
                Stop
              </button>
            ) : (
              <button
                className="chat-send-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                Send
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
