import React, { useState, useCallback, useEffect } from 'react';
import {
  Key,
  Globe,
  Cpu,
  Thermometer,
  Hash,
  MessageSquare,
  TestTube,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { AIConfig } from '@/shared/types';
import { useAIStore } from '@/renderer/store/useAIStore';

const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'custom', label: '自定义模型' },
];

// ------------------------------------------------------------------
// AISettings component
// ------------------------------------------------------------------
const AISettings: React.FC = () => {
  const { config, setConfig } = useAIStore();

  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [customModel, setCustomModel] = useState('');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = useCallback(
    <K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
      setLocalConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    const finalConfig = {
      ...localConfig,
      model: localConfig.model === 'custom' && customModel ? customModel : localConfig.model,
    };
    setConfig(finalConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [localConfig, customModel, setConfig]);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const response = await fetch(localConfig.apiUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: localConfig.model === 'custom' && customModel ? customModel : localConfig.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      setTestResult(response.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  }, [localConfig, customModel]);

  const sliderThumb = "appearance-none w-full h-2 rounded-lg bg-slate-700 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-indigo-400";

  return (
    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <Cpu size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-100">AI 设置</h3>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* API Key */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Key size={12} />
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localConfig.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-..."
              className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        {/* API Base URL */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Globe size={12} />
            API Base URL
          </label>
          <input
            type="text"
            value={localConfig.apiUrl}
            onChange={(e) => handleChange('apiUrl', e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Model selection */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Cpu size={12} />
            模型选择
          </label>
          <select
            value={localConfig.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {localConfig.model === 'custom' && (
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="输入自定义模型名称"
              className="mt-2 w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
        </div>

        {/* Temperature slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Thermometer size={12} />
              Temperature
            </label>
            <span className="text-xs font-mono text-indigo-400">
              {localConfig.temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={localConfig.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className={sliderThumb}
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>精确 (0)</span>
            <span>平衡 (0.5)</span>
            <span>创意 (1)</span>
          </div>
        </div>

        {/* Max Tokens slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Hash size={12} />
              Max Tokens
            </label>
            <span className="text-xs font-mono text-indigo-400">
              {localConfig.maxTokens}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={localConfig.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            className={sliderThumb}
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>100</span>
            <span>1000</span>
            <span>2000</span>
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <MessageSquare size={12} />
            System Prompt (直播人设)
          </label>
          <textarea
            value={localConfig.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            placeholder="设定AI主播的人设、语气风格、回答规则等..."
            rows={5}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Test connection result */}
        {testResult === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-2 text-xs text-green-400">
            <CheckCircle2 size={14} />
            连接成功！API配置正确。
          </div>
        )}
        {testResult === 'error' && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs text-red-400">
            <AlertCircle size={14} />
            连接失败，请检查API Key和Base URL。
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
        <button
          onClick={handleTestConnection}
          disabled={testing || !localConfig.apiKey}
          className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
          测试连接
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
        >
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>
    </div>
  );
};

export default AISettings;
