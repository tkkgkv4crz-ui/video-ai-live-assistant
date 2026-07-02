import React, { useState, useCallback } from 'react';
import {
  Save,
  X,
  Eye,
  Variable,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { PromptTemplate } from '@/shared/types';
import { useAIStore } from '@/renderer/store/useAIStore';

const CATEGORIES: { value: PromptTemplate['category']; label: string }[] = [
  { value: 'greeting', label: '问候语' },
  { value: 'product', label: '产品介绍' },
  { value: 'qa', label: '问答' },
  { value: 'custom', label: '自定义' },
];

const VARIABLES = ['{{topic}}', '{{name}}', '{{product}}', '{{price}}', '{{feature}}'];

// ------------------------------------------------------------------
// PromptEditor component
// ------------------------------------------------------------------
interface PromptEditorProps {
  initialPrompt?: PromptTemplate | null;
  onCancel?: () => void;
  onSave?: (prompt: PromptTemplate) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  initialPrompt,
  onCancel,
  onSave,
}) => {
  const { templates, addTemplate } = useAIStore();

  const [name, setName] = useState(initialPrompt?.name || '');
  const [category, setCategory] = useState<PromptTemplate['category']>(
    initialPrompt?.category || 'custom',
  );
  const [content, setContent] = useState(initialPrompt?.content || '');
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInsertVariable = useCallback((variable: string) => {
    setContent((prev) => prev + variable);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim() || !content.trim()) return;
    const prompt: PromptTemplate = {
      id: initialPrompt?.id || Date.now().toString(),
      name: name.trim(),
      content: content.trim(),
      category,
    };
    addTemplate(prompt);
    onSave?.(prompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [name, content, category, initialPrompt, addTemplate, onSave]);

  const previewContent = content
    .replace(/\{\{topic\}\}/g, '夏季新品发布会')
    .replace(/\{\{name\}\}/g, '小美')
    .replace(/\{\{product\}\}/g, '智能空调')
    .replace(/\{\{price\}\}/g, '2999元')
    .replace(/\{\{feature\}\}/g, '节能环保、智能温控');

  return (
    <div className="flex h-full flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            {initialPrompt ? '编辑提示词' : '新建提示词'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <FileText size={12} />
            提示词名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：新品介绍开场白"
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category select */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Tag size={12} />
            分类
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variable placeholders */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Variable size={12} />
            变量占位符（点击插入）
          </label>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <button
                key={v}
                onClick={() => handleInsertVariable(v)}
                className="rounded-md bg-slate-700/80 px-2 py-1 text-xs text-indigo-300 hover:bg-slate-600 hover:text-indigo-200 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Content textarea */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <FileText size={12} />
            提示词内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入提示词内容..."
            rows={8}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Eye size={12} />
          {showPreview ? '隐藏预览' : '显示预览'}
        </button>

        {/* Preview */}
        {showPreview && (
          <div className="rounded-lg bg-slate-900/60 border border-slate-700/50 p-3">
            <p className="text-xs font-medium text-slate-400 mb-1.5">预览效果：</p>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {previewContent}
            </p>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-700 px-4 py-3">
        <button
          onClick={onCancel}
          className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !content.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? '已保存' : '保存'}
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;
