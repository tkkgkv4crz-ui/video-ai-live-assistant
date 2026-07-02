import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  Gauge,
  Music,
  Headphones,
  Save,
  CheckCircle2,
  Play,
  Loader2,
  Mic,
} from 'lucide-react';
import type { TTSConfig, VoiceProfile } from '@/shared/types';
import { useTTSStore } from '@/renderer/store/useTTSStore';

// ------------------------------------------------------------------
// VoiceSettings component
// ------------------------------------------------------------------
const VoiceSettings: React.FC = () => {
  const { config, setConfig } = useTTSStore();

  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [localConfig, setLocalConfig] = useState<TTSConfig>(config);
  const [testText, setTestText] = useState('你好，这是语音合成测试。');
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      const available = synth.getVoices();
      const profiles: VoiceProfile[] = available.map((v, i) => ({
        id: v.voiceURI + '_' + i,
        name: v.name,
        description: `${v.lang} - ${v.localService ? '本地' : '远程'}`,
        lang: v.lang,
        localService: v.localService ? 'local' : 'remote',
        gender: v.name.toLowerCase().includes('female') || v.name.includes('女')
          ? 'female'
          : v.name.toLowerCase().includes('male') || v.name.includes('男')
            ? 'male'
            : 'neutral',
      }));
      setVoices(profiles);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleChange = useCallback(
    <K extends keyof TTSConfig>(key: K, value: TTSConfig[K]) => {
      setLocalConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    setConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [localConfig, setConfig]);

  const handleTest = useCallback(() => {
    if (!synthRef.current || isPlaying) return;

    const utterance = new SpeechSynthesisUtterance(testText);
    const selectedVoice = window.speechSynthesis
      .getVoices()
      .find((v) => v.voiceURI === localConfig.voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = localConfig.rate;
    utterance.pitch = localConfig.pitch;
    utterance.volume = localConfig.volume;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
  }, [testText, localConfig, isPlaying]);

  const sliderThumb =
    "appearance-none w-full h-2 rounded-lg bg-slate-700 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-indigo-400";

  return (
    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <Headphones size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-100">声音设置</h3>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Voice selection */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Mic size={12} />
            语音选择
          </label>
          <select
            value={localConfig.voice}
            onChange={(e) => handleChange('voice', e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">-- 选择语音 --</option>
            {voices.map((v) => (
              <option key={v.id} value={v.localService === 'local' ? v.name : v.id}>
                {v.name} ({v.description})
              </option>
            ))}
          </select>
          {voices.length === 0 && (
            <p className="text-[10px] text-amber-400">正在加载可用语音列表...</p>
          )}
        </div>

        {/* Rate slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Gauge size={12} />
              语速
            </label>
            <span className="text-xs font-mono text-indigo-400">{localConfig.rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.1}
            value={localConfig.rate}
            onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
            className={sliderThumb}
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>慢 (0.5x)</span>
            <span>正常 (1.0x)</span>
            <span>快 (2.0x)</span>
          </div>
        </div>

        {/* Pitch slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Music size={12} />
              音调
            </label>
            <span className="text-xs font-mono text-indigo-400">{localConfig.pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.1}
            value={localConfig.pitch}
            onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
            className={sliderThumb}
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>低 (0.5)</span>
            <span>默认 (1.0)</span>
            <span>高 (2.0)</span>
          </div>
        </div>

        {/* Volume slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Volume2 size={12} />
              音量
            </label>
            <span className="text-xs font-mono text-indigo-400">{Math.round(localConfig.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={localConfig.volume}
            onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
            className={sliderThumb}
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>静音 (0%)</span>
            <span>50%</span>
            <span>最大 (100%)</span>
          </div>
        </div>

        {/* Test section */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/50 p-3 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Headphones size={12} />
            试听
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="输入试听文本..."
              className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleTest}
              disabled={isPlaying || !testText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              试听
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end border-t border-slate-700 px-4 py-3">
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

export default VoiceSettings;
