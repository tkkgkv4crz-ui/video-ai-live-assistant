import type { PromptTemplate } from '@/shared/types';

class PromptManager {
  private templates: PromptTemplate[];

  constructor() {
    this.templates = [...this.defaultTemplates];
  }

  getTemplates(): PromptTemplate[] {
    return [...this.templates];
  }

  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  getDefaultPrompt(liveTopic: string): string {
    return `你正在进行一场关于"${liveTopic}"的直播。请根据以下上下文生成下一段直播内容：

## 之前的直播内容
{{previousContent}}

## 最新观众弹幕
{{comments}}

## 要求
1. 内容要与主题"${liveTopic}"相关
2. 语气热情友好，像在与观众面对面交流
3. 适当回应观众弹幕中的问题或观点
4. 段落长度控制在100-300字
5. 结尾可以抛出一个互动问题，引导观众发弹幕

请生成下一段直播内容：`;
  }

  formatPrompt(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  addTemplate(template: PromptTemplate): void {
    this.templates.push(template);
  }

  removeTemplate(id: string): void {
    this.templates = this.templates.filter((t) => t.id !== id);
  }

  // Preset templates
  private defaultTemplates: PromptTemplate[] = [
    {
      id: 'greeting-1',
      name: '开场欢迎',
      content: `大家好！欢迎来到直播间！我是你们的主播，今天我们要聊的话题是"{{topic}}"。

在直播开始之前，先问问大家，你们对{{topic}}最感兴趣的是什么呢？

记得点个关注，这样下次开播就不会错过啦！`,
      category: 'greeting',
    },
    {
      id: 'greeting-2',
      name: '新观众欢迎',
      content: `欢迎新进来的朋友们！我们正在聊"{{topic}}"这个话题。

如果你是第一次来直播间，打个"1"让我看到你！

大家有什么问题都可以在弹幕里提出来，我会尽量回复每一条弹幕。`,
      category: 'greeting',
    },
    {
      id: 'product-1',
      name: '产品介绍',
      content: `接下来给大家介绍一下今天的产品。

{{topic}}的最大亮点在于：
1. 设计简洁大方
2. 功能实用性强  
3. 性价比超高

大家如果对产品有任何疑问，随时在弹幕里问我！`,
      category: 'product',
    },
    {
      id: 'qa-1',
      name: '问答互动',
      content: `我看到有很多朋友在问关于{{topic}}的问题，我来统一回答一下。

{{comments}}

希望这些解答对大家有帮助！还有其他问题继续问，我会持续关注的。`,
      category: 'qa',
    },
    {
      id: 'qa-2',
      name: '常见问题解答',
      content: `经常被问到的一个问题：{{topic}}到底值不值得入手？

我的建议是：
- 如果你是初学者，完全可以试试
- 如果你已经有经验了，这个也能满足你的进阶需求
- 关键是性价比真的很高

{{comments}}

大家觉得呢？弹幕里说说你们的看法！`,
      category: 'qa',
    },
    {
      id: 'custom-1',
      name: '自由发挥',
      content: `{{topic}}

{{previousContent}}

{{comments}}

请根据以上内容继续直播。`,
      category: 'custom',
    },
    {
      id: 'custom-2',
      name: '互动引导',
      content: `聊了这么多关于{{topic}}的内容，我想听听大家的想法。

{{comments}}

觉得我说得有道理的扣个"666"，有不同意见的也可以弹幕里告诉我，咱们一起讨论！`,
      category: 'custom',
    },
    {
      id: 'ending-1',
      name: '直播结束',
      content: `好了，今天的直播就到这里啦！感谢每一位朋友的陪伴。

今天我们聊了{{topic}}的方方面面，希望对你有所帮助。

没点关注的朋友记得点个关注，我们下次直播再见！

大家晚安/再见！`,
      category: 'custom',
    },
  ];
}

export const promptManager = new PromptManager();
