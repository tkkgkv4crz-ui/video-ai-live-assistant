import type { AIConfig, ChatMessage, PromptTemplate, Comment } from '@/shared/types';
import { promptManager } from './prompt-manager';

const defaultAIConfig: AIConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '你是一个专业的直播主播，请用热情友好的语气与观众互动。',
};

class AIService {
  private config: AIConfig;

  constructor(config: AIConfig = defaultAIConfig) {
    this.config = { ...config };
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  // Send messages to AI and get response
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('未配置API Key，请先在设置中配置AI API');
    }

    const url = `${this.config.apiUrl.replace(/\/$/, '')}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`AI API请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('AI响应格式异常');
    }

    return content.trim();
  }

  // Generate live streaming content
  async generateLiveContent(context: {
    topic: string;
    previousContent?: string[];
    comments?: Comment[];
  }): Promise<string> {
    const prompt = promptManager.getDefaultPrompt(context.topic);

    const variables: Record<string, string> = {
      topic: context.topic,
      previousContent: (context.previousContent || []).join('\n'),
      comments: (context.comments || [])
        .map((c) => `${c.username}: ${c.content}`)
        .join('\n'),
    };

    const formattedPrompt = promptManager.formatPrompt(prompt, variables);

    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: this.config.systemPrompt,
        timestamp: Date.now(),
      },
      {
        id: 'user',
        role: 'user',
        content: formattedPrompt,
        timestamp: Date.now(),
      },
    ];

    return this.sendMessage(messages);
  }

  // Test AI connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        return false;
      }

      const messages: ChatMessage[] = [
        {
          id: 'system',
          role: 'system',
          content: 'You are a helpful assistant. Reply with only "OK".',
          timestamp: Date.now(),
        },
        {
          id: 'user',
          role: 'user',
          content: 'Say OK',
          timestamp: Date.now(),
        },
      ];

      const response = await this.sendMessage(messages);
      return response.length > 0;
    } catch {
      return false;
    }
  }

  // Generate with a specific template
  async generateWithTemplate(
    template: PromptTemplate,
    variables: Record<string, string>
  ): Promise<string> {
    const formattedPrompt = promptManager.formatPrompt(template.content, variables);

    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: this.config.systemPrompt,
        timestamp: Date.now(),
      },
      {
        id: 'user',
        role: 'user',
        content: formattedPrompt,
        timestamp: Date.now(),
      },
    ];

    return this.sendMessage(messages);
  }
}

export const aiService = new AIService(defaultAIConfig);
