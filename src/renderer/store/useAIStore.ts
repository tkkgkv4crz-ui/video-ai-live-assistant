import { create } from 'zustand';
import type { AIConfig, ChatMessage, PromptTemplate } from '@/shared/types';
import { aiService } from '@/renderer/services/ai-service';

const defaultAIConfig: AIConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '你是一个专业的直播主播，请用热情友好的语气与观众互动。',
};

interface AIState {
  messages: ChatMessage[];
  isGenerating: boolean;
  config: AIConfig;
  templates: PromptTemplate[];

  setConfig: (config: Partial<AIConfig>) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setIsGenerating: (v: boolean) => void;
  generateResponse: (context?: string) => Promise<string>;
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  isGenerating: false,
  config: { ...defaultAIConfig },
  templates: [],

  setConfig: (partial) =>
    set((state) => {
      const newConfig = { ...state.config, ...partial };
      aiService.updateConfig(newConfig);
      return { config: newConfig };
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),

  setIsGenerating: (v) => set({ isGenerating: v }),

  generateResponse: async (context?: string) => {
    const state = get();
    if (state.isGenerating) return '';

    set({ isGenerating: true });
    try {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: context || '请继续直播内容',
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, userMessage],
      }));

      const response = await aiService.sendMessage([
        { id: 'system', role: 'system', content: state.config.systemPrompt, timestamp: Date.now() },
        ...get().messages.slice(-10),
      ]);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, assistantMessage],
      }));

      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'AI生成失败';
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `抱歉，生成内容时出错: ${errorMsg}`,
        timestamp: Date.now(),
      };
      set((s) => ({
        messages: [...s.messages, errorMessage],
      }));
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),

  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
}));
