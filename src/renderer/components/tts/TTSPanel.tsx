import React, { useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  ListMusic,
  Trash2,
  Loader2,
  Mic,
  SkipForward,
  Radio,
} from 'lucide-react';
import type { TTSState as TTSStateType } from '@/shared/types';
import { useTTSStore } from '@/renderer/store/useTTSStore';

// ------------------------------------------------------------------
// Status helpers
// ------------------------------------------------------------------
function getStatusConfig(state: TTSStateType) {
  switch (state) {
    case 'speaking':
      return {
        label: '播报中',
        dotColor: 'bg-green-500',
        pulse: true,
        textColor: 'text-green-400',
      };
    case 'paused':
      return {
        label: '已暂停',
        dotColor: 'bg-amber-500',
        pulse: false,
        textColor: 'text-amber-400',
      };
    case 'queued':
      return {
        label: '队列中',
        dotColor: 'bg-indigo-500',
        pulse: true,
        textColor: 'text-indigo-400',
      };
    default:
      return {
        label: '闲置',
        dotColor: 'bg-slate-500',
        pulse: false,
        textColor: 'text-slate-400',
      };
  }
}

// ------------------------------------------------------------------
// TTSPanel component
// ------------------------------------------------------------------
const TTSPanel: React.FC = () => {
  const {
    currentState,
    queue,
    speak,
    stop,
    pause,
    resume,
    clearQueue,
  } = useTTSStore();

  const statusConfig = getStatusConfig(currentState);
  const isSpeaking = currentState === 'speaking';
  const isPaused = currentState === 'paused';
  const isIdle = currentState === 'idle';

  const [currentText, setCurrentText] = useState('');

  const handlePlayPause = useCallback(() => {
    if (isSpeaking) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(currentText || '测试播报');
    }
  }, [isSpeaking, isPaused, pause, resume, speak, currentText]);

  const handleSkipCurrent = useCallback(() => {
    stop();
  }, [stop]);

  return (
    <div className="flex h-full flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">TTS 控制</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dotColor} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
        </div>
      </div>

      {/* Current playback info */}
      <div className="border-b border-slate-700 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/50">
            {isSpeaking ? (
              <Volume2 size={20} className="text-green-400 animate-pulse" />
            ) : isPaused ? (
              <VolumeX size={20} className="text-amber-400" />
            ) : (
              <Mic size={20} className="text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">
              {isSpeaking ? '正在播报：' : isPaused ? '已暂停：' : '当前内容：'}
            </p>
            <p className="text-sm text-slate-200 truncate">
              {currentText || '暂无播报内容'}
            </p>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-3 border-b border-slate-700 px-4 py-3">
        <button
          onClick={stop}
          disabled={isIdle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="停止"
        >
          <Square size={16} />
        </button>

        <button
          onClick={handlePlayPause}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isSpeaking
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
          title={isSpeaking ? '暂停' : isPaused ? '继续' : '开始播报'}
        >
          {isSpeaking ? <Pause size={20} /> : isPaused ? <Play size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={handleSkipCurrent}
          disabled={isIdle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="跳过当前"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Queue header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <ListMusic size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-300">播报队列</span>
          <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
            {queue.length}
          </span>
        </div>
        <button
          onClick={clearQueue}
          disabled={queue.length === 0}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={10} />
          清空队列
        </button>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <ListMusic size={28} className="mb-2 opacity-50" />
            <p className="text-xs">队列为空</p>
          </div>
        )}
        {queue.map((text, index) => (
          <div
            key={`${text}_${index}`}
            className={`flex items-center gap-2 rounded-md px-3 py-2 mb-1 ${
              index === 0 && isSpeaking
                ? 'bg-indigo-500/10 border border-indigo-500/20'
                : 'bg-slate-700/30'
            }`}
          >
            {index === 0 && isSpeaking ? (
              <Loader2 size={12} className="shrink-0 animate-spin text-indigo-400" />
            ) : (
              <div className="h-2 w-2 shrink-0 rounded-full bg-slate-500" />
            )}
            <span className="flex-1 truncate text-xs text-slate-300">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TTSPanel;
