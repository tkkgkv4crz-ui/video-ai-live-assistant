import React, { useState } from 'react'
import { Bot, Key, Link, BrainCircuit, Thermometer, Hash, BookOpen, Plus, Pencil, Trash2, Save, TestTube, MessageSquare } from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import Button from '@/renderer/components/common/Button'
import Input from '@/renderer/components/common/Input'
import Select from '@/renderer/components/common/Select'
import Slider from '@/renderer/components/common/Slider'
import Toggle from '@/renderer/components/common/Toggle'
import AISettings from '@/renderer/components/ai/AISettings'
import ChatPanel from '@/renderer/components/ai/ChatPanel'
import type { PromptTemplate, AIConfig } from '@/shared/types'

/* ── Mock data ── */
const defaultConfig: AIConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0.8,
  maxTokens: 500,
  systemPrompt: '你是一位专业的直播主播，热情、专业、善于互动。请根据观众的问题和直播主题进行回答，保持内容有趣且有价值。',
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: '开场欢迎',
    content: '大家好！欢迎来到{{topic}}直播间，我是你们的主播。今天我们一起来聊聊{{topic}}，有什么问题随时在评论区提问哦！',
    category: 'greeting',
  },
  {
    id: '2',
    name: '产品介绍',
    content: '接下来给大家介绍一款非常实用的产品——{{product}}。它的主要特点是{{features}}，非常适合{{target}}使用。',
    category: 'product',
  },
  {
    id: '3',
    name: '问答回复',
    content: '{{user}}问了一个很好的问题：{{question}}。关于这个问题，我的看法是...',
    category: 'qa',
  },
]

const modelOptions = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'custom', label: '自定义模型' },
]

/* ── Prompt Editor Modal ── */
const PromptEditorModal: React.FC<{
  template?: PromptTemplate
  onSave: (t: PromptTemplate) => void
  onClose: () => void
}> = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '')
  const [category, setCategory] = useState<PromptTemplate['category']>(template?.category || 'custom')
  const [content, setContent] = useState(template?.content || '')

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return
    onSave({
      id: template?.id || Date.now().toString(),
      name: name.trim(),
      content: content.trim(),
      category,
    })
    onClose()
  }

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + '{{' + variable + '}}')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">
            {template ? '编辑提示词' : '新建提示词'}
          </h3>

          <Input
            label="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="提示词名称"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">分类</label>
            <div className="flex gap-2">
              {(['greeting', 'product', 'qa', 'custom'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {cat === 'greeting' ? '开场' : cat === 'product' ? '产品' : cat === 'qa' ? '问答' : '自定义'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
              placeholder="输入提示词内容..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">插入变量</label>
            <div className="flex flex-wrap gap-1.5">
              {['topic', 'name', 'product', 'features', 'target', 'user', 'question'].map((v) => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                >
                  {'{{' + v + '}}'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">预览</p>
            <p className="text-sm text-slate-300">{content || '提示词预览...'}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              保存
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ── Main Page ── */
const AIConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>(defaultConfig)
  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  const handleSave = () => {
    // TODO: Save to store
    console.log('Saving AI config:', config)
  }

  const handleTest = async () => {
    setTestResult('测试中...')
    // TODO: Call AI service test
    setTimeout(() => setTestResult('连接成功！'), 1500)
  }

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEditTemplate = (t: PromptTemplate) => {
    setEditingTemplate(t)
    setShowEditor(true)
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSaveTemplate = (t: PromptTemplate) => {
    setTemplates((prev) => {
      const exists = prev.find((p) => p.id === t.id)
      if (exists) {
        return prev.map((p) => (p.id === t.id ? t : p))
      }
      return [...prev, t]
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">AI 对话配置</h1>
            <p className="text-sm text-slate-400">配置大语言模型参数、人设和提示词模板</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          保存配置
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: AI Settings */}
        <div className="space-y-6">
          {/* API Settings */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-medium text-slate-200">API 设置</h2>
              </div>

              <Input
                label="API Key"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
              />

              <Input
                label="API Base URL"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />

              <Select
                label="模型"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                options={modelOptions}
              />

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleTest}>
                  <TestTube className="w-3.5 h-3.5" />
                  测试连接
                </Button>
                {testResult && (
                  <span className={`text-sm self-center ${testResult.includes('成功') ? 'text-green-400' : 'text-amber-400'}`}>
                    {testResult}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Personality */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-medium text-slate-200">人设设定</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">System Prompt</label>
                <textarea
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  placeholder="设定AI主播的人设、语气风格..."
                />
                <p className="text-xs text-slate-500 mt-1">定义AI主播的性格、知识领域和说话风格</p>
              </div>
            </div>
          </Card>

          {/* Parameters */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-medium text-slate-200">参数调节</h2>
              </div>

              <Slider
                label="Temperature"
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(v) => setConfig({ ...config, temperature: v })}
                valueFormatter={(v) => v.toFixed(1)}
              />
              <p className="text-xs text-slate-500 -mt-3">控制回复的随机性，越高越 creative</p>

              <Slider
                label="Max Tokens"
                min={100}
                max={2000}
                step={50}
                value={config.maxTokens}
                onChange={(v) => setConfig({ ...config, maxTokens: v })}
                valueFormatter={(v) => `${v}`}
              />
              <p className="text-xs text-slate-500 -mt-3">单次回复的最大长度</p>
            </div>
          </Card>
        </div>

        {/* Right: Prompt Templates + Chat Preview */}
        <div className="space-y-6">
          {/* Prompt Templates */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-medium text-slate-200">提示词模板</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={handleAddTemplate}>
                  <Plus className="w-3.5 h-3.5" />
                  新建
                </Button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-700/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">{t.name}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            t.category === 'greeting'
                              ? 'bg-green-500/20 text-green-400'
                              : t.category === 'product'
                              ? 'bg-amber-500/20 text-amber-400'
                              : t.category === 'qa'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-600 text-slate-400'
                          }`}
                        >
                          {t.category === 'greeting' ? '开场' : t.category === 'product' ? '产品' : t.category === 'qa' ? '问答' : '自定义'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTemplate(t)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Chat Preview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-medium text-slate-200">对话预览</h2>
              </div>
              <ChatPanel />
            </div>
          </Card>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <PromptEditorModal
          template={editingTemplate || undefined}
          onSave={handleSaveTemplate}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}

export default AIConfigPage
