import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Square,
  Radio,
  TrendingUp,
  Activity,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import type { StreamStatus, StreamStats } from '@/shared/types';
import { useStreamStore } from '@/renderer/store/useStreamStore';

// ------------------------------------------------------------------
// Status helpers
// ------------------------------------------------------------------
function getStatusConfig(status: StreamStatus) {
  switch (status.state) {
    case 'connecting':
      return {
        label: '连接中',
        dotColor: 'bg-amber-500',
        pulse: true,
        textColor: 'text-amber-400',
        bgGlow: 'shadow-amber-500/20',
      };
    case 'streaming':
      return {
        label: '直播中',
        dotColor: 'bg-green-500',
        pulse: true,
        textColor: 'text-green-400',
        bgGlow: 'shadow-green-500/20',
      };
    case 'error':
      return {
        label: '错误',
        dotColor: 'bg-red-500',
        pulse: false,
        textColor: 'text-red-400',
        bgGlow: 'shadow-red-500/20',
      };
    case 'stopping':
      return {
        label: '停止中',
        dotColor: 'bg-orange-500',
        pulse: true,
        textColor: 'text-orange-400',
        bgGlow: '',
      };
    default:
      return {
        label: '未开始',
        dotColor: 'bg-slate-500',
        pulse: false,
        textColor: 'text-slate-400',
        bgGlow: '',
      };
  }
}

// ------------------------------------------------------------------
// Format duration HH:MM:SS
// ------------------------------------------------------------------
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ------------------------------------------------------------------
// StreamPanel component
// ------------------------------------------------------------------
const StreamPanel: React.FC = () => {
  const store = useStreamStore();
  const { status, stats, startStream, stopStream } = store;

  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(status.duration);

  const statusConfig = getStatusConfig(status);
  const isStreaming = status.state === 'streaming';
  const isConnecting = status.state === 'connecting';
  const isIdle = status.state === 'idle';
  const isError = status.state === 'error';

  // Duration timer
  useEffect(() => {
    setElapsed(status.duration);
    if (isStreaming) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming, status.duration]);

  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isStreaming || isConnecting) {
        await stopStream();
      } else {
        await startStream();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isStreaming, isConnecting, startStream, stopStream]);

  return (
    <div className="flex h-full flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">推流控制</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${statusConfig.dotColor} ${
              statusConfig.pulse ? 'animate-pulse' : ''
            }`}
          />
          <span className={`text-xs font-medium ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Main control area */}
      <div className="flex flex-col items-center justify-center border-b border-slate-700 px-4 py-6 gap-4">
        {/* Big start/stop button */}
        <button
          onClick={handleToggle}
          disabled={isLoading || status.state === 'stopping'}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isStreaming || isConnecting
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
              : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
          } ${isStreaming || isConnecting ? statusConfig.bgGlow : ''}`}
        >
          {isLoading || isConnecting ? (
            <Loader2 size={32} className="animate-spin text-white" />
          ) : isStreaming ? (
            <Square size={32} className="text-white" />
          ) : (
            <Play size={32} className="text-white ml-1" />
          )}
        </button>

        <span className="text-sm font-medium text-slate-300">
          {isLoading
            ? '处理中...'
            : isStreaming
              ? '停止直播'
              : isConnecting
                ? '连接中...'
                : '开始直播'}
        </span>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-700 px-4 py-3">
        <Clock size={16} className="text-slate-400" />
        <span className="text-2xl font-mono font-bold text-slate-100 tracking-wider">
          {formatDuration(elapsed)}
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-px bg-slate-700 border-b border-slate-700">
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-3">
          <TrendingUp size={14} className="text-indigo-400" />
          <div>
            <p className="text-[10px] text-slate-400">当前码率</p>
            <p className="text-sm font-mono font-medium text-slate-200">
              {status.bitrate ? `${(status.bitrate / 1000).toFixed(1)} kb/s` : '--'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-3">
          <Activity size={14} className="text-indigo-400" />
          <div>
            <p className="text-[10px] text-slate-400">帧率</p>
            <p className="text-sm font-mono font-medium text-slate-200">
              {status.fps ? `${status.fps} FPS` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional stats */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <span className="text-[10px] text-slate-400">总帧数: {stats.totalFrames.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400">丢弃: {stats.droppedFrames}</span>
        <span className="text-[10px] text-slate-400">平均码率: {(stats.avgBitrate / 1000).toFixed(0)} kb/s</span>
      </div>

      {/* Error display */}
      {isError && status.error && (
        <div className="flex items-start gap-2 bg-red-500/10 border-t border-red-500/20 px-4 py-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-xs font-medium text-red-400">推流错误</p>
            <p className="text-xs text-red-300/80 mt-0.5">{status.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamPanel;
