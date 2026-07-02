import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  User,
  Send,
  RefreshCw,
  Mic,
  Sparkles,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { ChatMessage } from '@/shared/types';
import { useAIStore } from '@/renderer/store/useAIStore';

// ------------------------------------------------------------------
// Format timestamp to HH:MM
// ------------------------------------------------------------------
function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// ------------------------------------------------------------------
// MessageBubble component
// ------------------------------------------------------------------
interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-indigo-400'
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center gap-2 text-xs text-slate-400 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>{isUser ? '用户' : isAssistant ? 'AI助手' : '系统'}</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>

          <div
            className={`rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
              isUser ? 'bg-indigo-500/20 text-slate-100' : 'bg-slate-700/50 text-slate-200'
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ChatPanel component
// ------------------------------------------------------------------
const ChatPanel: React.FC = () => {
  const {
    messages,
    isGenerating,
    addMessage,
    generateResponse,
    clearMessages,
  } = useAIStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isGenerating) return;
    setInputValue('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    try {
      await generateResponse(trimmed);
    } catch {
      // Error handled in store
    }
  }, [inputValue, isGenerating, addMessage, generateResponse]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleQuickAction = useCallback(
    (action: string) => {
      if (isGenerating) return;
      switch (action) {
        case 'generate': {
          const generateMsg = '请生成一段直播内容';
          const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: generateMsg,
            timestamp: Date.now(),
          };
          addMessage(userMessage);
          generateResponse(generateMsg).catch(() => {});
          break;
        }
        case 'regenerate':
          generateResponse().catch(() => {});
          break;
        case 'broadcast': {
          const lastAssistant = [...messages]
            .reverse()
            .find((m) => m.role === 'assistant');
          if (lastAssistant) speakText(lastAssistant.content);
          break;
        }
      }
    },
    [isGenerating, addMessage, generateResponse, messages, speakText],
  );

  return (
    <div className="flex h-full flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">AI 对话</h3>
        </div>
        <button
          onClick={clearMessages}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          title="清空对话"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <Bot size={40} className="mb-3 opacity-50" />
            <p className="text-sm">暂无对话消息</p>
            <p className="text-xs mt-1">在下方输入框开始对话</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isGenerating && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-indigo-400">
                <Bot size={16} />
              </div>
              <div className="rounded-lg bg-slate-700/50 px-4 py-2.5">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick action buttons */}
      <div className="flex items-center gap-2 border-t border-slate-700 px-4 pt-2.5">
        <button
          onClick={() => handleQuickAction('generate')}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          <Sparkles size={12} />
          生成直播内容
        </button>
        <button
          onClick={() => handleQuickAction('regenerate')}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} />
          重新生成
        </button>
        <button
          onClick={() => handleQuickAction('broadcast')}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          <Mic size={12} />
          播报
        </button>
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-slate-700 p-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isGenerating}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
