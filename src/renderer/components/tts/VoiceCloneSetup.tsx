import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  Trash2,
  Wand2,
  Save,
  Loader2,
  Mic,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  FileAudio,
  X,
} from 'lucide-react';
import type { VoiceProfile } from '@/shared/types';
import { useTTSStore } from '@/renderer/store/useTTSStore';

// ------------------------------------------------------------------
// VoiceCloneSetup component
// ------------------------------------------------------------------
const VoiceCloneSetup: React.FC = () => {
  const ttsStore = useTTSStore();

  // Clone-related state (fallback since useTTSStore doesn't have clone methods)
  const [clonedVoices, setClonedVoices] = useState<VoiceProfile[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloningProgress, setCloningProgress] = useState(0);

  const removeClonedVoice = useCallback((id: string) => {
    setClonedVoices((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const startCloning = useCallback(async (name: string, _audioFile: File): Promise<boolean> => {
    setIsCloning(true);
    setCloningProgress(0);
    try {
      // Simulate cloning progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCloningProgress(i);
      }
      const newVoice: VoiceProfile = {
        id: `clone_${Date.now()}`,
        name,
        description: '克隆声音',
        lang: 'zh-CN',
        localService: 'local',
        gender: 'neutral',
      };
      setClonedVoices((prev) => [...prev, newVoice]);
      return true;
    } catch {
      return false;
    } finally {
      setIsCloning(false);
    }
  }, []);

  const [cloneName, setCloneName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [useExternal, setUseExternal] = useState(false);
  const [externalApiKey, setExternalApiKey] = useState('');
  const [externalApiUrl, setExternalApiUrl] = useState('');
  const [cloneResult, setCloneResult] = useState<'idle' | 'success' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) return;
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setCloneResult('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handlePlayPreview = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAudioFile(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsPlaying(false);
    setCloneResult('idle');
  }, []);

  const handleStartClone = useCallback(async () => {
    if (!cloneName.trim() || !audioFile) return;
    setCloneResult('idle');
    try {
      const result = await startCloning(cloneName.trim(), audioFile);
      setCloneResult(result ? 'success' : 'error');
    } catch {
      setCloneResult('error');
    }
  }, [cloneName, audioFile, startCloning]);

  return (
    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <Wand2 size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-100">声音克隆</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Description */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-700/30 border border-slate-700/50 p-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-indigo-400" />
          <p className="text-xs text-slate-300 leading-relaxed">
            上传一段参考音频（建议10秒以上清晰人声），AI将克隆该声音用于直播播报。
            支持 MP3、WAV、M4A 格式。
          </p>
        </div>

        {/* Audio upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : audioFile
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-slate-600 bg-slate-700/20 hover:border-slate-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {audioFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileAudio size={28} className="text-green-400" />
              <p className="text-sm text-slate-200 font-medium">{audioFile.name}</p>
              <p className="text-xs text-slate-400">
                {(audioFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X size={10} />
                移除文件
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-slate-400" />
              <p className="text-sm text-slate-300">
                点击上传或拖拽音频文件到此处
              </p>
              <p className="text-xs text-slate-500">支持 MP3, WAV, M4A</p>
            </div>
          )}
        </div>

        {/* Audio preview */}
        {audioUrl && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-700/30 border border-slate-700/50 px-3 py-2">
            <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} />
            <button
              onClick={handlePlayPreview}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="text-xs text-slate-300">
              {isPlaying ? '播放中...' : '点击播放参考音频'}
            </span>
          </div>
        )}

        {/* Clone name input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Mic size={12} />
            克隆声音名称
          </label>
          <input
            type="text"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            placeholder="例如：我的声音1"
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Start clone button */}
        <button
          onClick={handleStartClone}
          disabled={isCloning || !cloneName.trim() || !audioFile}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCloning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              克隆中... {cloningProgress}%
            </>
          ) : (
            <>
              <Wand2 size={16} />
              开始克隆
            </>
          )}
        </button>

        {/* Progress bar */}
        {isCloning && (
          <div className="w-full rounded-full bg-slate-700 h-2 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${cloningProgress}%` }}
            />
          </div>
        )}

        {/* Clone result */}
        {cloneResult === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-2 text-xs text-green-400">
            <CheckCircle2 size={14} />
            声音克隆成功！已添加到已克隆声音列表。
          </div>
        )}
        {cloneResult === 'error' && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs text-red-400">
            <AlertCircle size={14} />
            克隆失败，请检查音频文件后重试。
          </div>
        )}

        {/* External TTS service toggle */}
        <div className="rounded-lg bg-slate-700/20 border border-slate-700/50 p-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useExternal}
              onChange={(e) => setUseExternal(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <ExternalLink size={12} />
              使用外部TTS服务
            </span>
          </label>

          {useExternal && (
            <div className="space-y-2 pl-6">
              <input
                type="text"
                value={externalApiUrl}
                onChange={(e) => setExternalApiUrl(e.target.value)}
                placeholder="API URL"
                className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-xs text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <input
                type="password"
                value={externalApiKey}
                onChange={(e) => setExternalApiKey(e.target.value)}
                placeholder="API Key"
                className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-xs text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>

        {/* Cloned voices list */}
        {clonedVoices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-300">已克隆声音</h4>
            {clonedVoices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between rounded-lg bg-slate-700/30 border border-slate-700/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-indigo-400" />
                  <span className="text-xs text-slate-200">{voice.name}</span>
                </div>
                <button
                  onClick={() => removeClonedVoice(voice.id)}
                  className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCloneSetup;
