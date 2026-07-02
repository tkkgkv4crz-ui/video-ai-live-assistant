import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Key,
  Video,
  Monitor,
  Gauge,
  Headphones,
  FileCode,
  Save,
  CheckCircle2,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import type { FFmpegConfig } from '@/shared/types';
import { useStreamStore } from '@/renderer/store/useStreamStore';

const VIDEO_BITRATES = [
  { value: '1000k', label: '1000 kbps (低)' },
  { value: '2000k', label: '2000 kbps (中低)' },
  { value: '3000k', label: '3000 kbps (推荐)' },
  { value: '5000k', label: '5000 kbps (高)' },
  { value: '8000k', label: '8000 kbps (极高)' },
];

const RESOLUTIONS = [
  { value: '854x480', label: '854x480 (480p)' },
  { value: '1280x720', label: '1280x720 (720p)' },
  { value: '1920x1080', label: '1920x1080 (1080p)' },
];

const FPS_OPTIONS = [
  { value: 24, label: '24 FPS (电影)' },
  { value: 30, label: '30 FPS (标准)' },
  { value: 60, label: '60 FPS (流畅)' },
];

const AUDIO_BITRATES = [
  { value: '64k', label: '64 kbps (低)' },
  { value: '128k', label: '128 kbps (标准)' },
  { value: '192k', label: '192 kbps (高)' },
];

// ------------------------------------------------------------------
// FFmpegSettings component
// ------------------------------------------------------------------
const FFmpegSettings: React.FC = () => {
  const store = useStreamStore();
  const { config, updateConfig } = store;

  const [localConfig, setLocalConfig] = useState<FFmpegConfig>(config);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = useCallback(
    <K extends keyof FFmpegConfig>(key: K, value: FFmpegConfig[K]) => {
      setLocalConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const errors: string[] = [];
    if (!localConfig.rtmpUrl.trim()) errors.push('RTMP服务器地址不能为空');
    if (!localConfig.streamKey.trim()) errors.push('推流密钥不能为空');
    setValidationErrors(errors);
    return errors.length === 0;
  }, [localConfig]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [localConfig, updateConfig, validate]);

  const selectFFmpegPath = useCallback(async () => {
    // Will be implemented via Electron dialog
    console.log('Select FFmpeg path');
  }, []);

  return (
    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <FileCode size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-100">FFmpeg 参数设置</h3>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* RTMP Server URL */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Server size={12} />
            RTMP 服务器地址
          </label>
          <input
            type="text"
            value={localConfig.rtmpUrl}
            onChange={(e) => handleChange('rtmpUrl', e.target.value)}
            placeholder="rtmp://..."
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Stream Key */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Key size={12} />
            推流密钥
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={localConfig.streamKey}
              onChange={(e) => handleChange('streamKey', e.target.value)}
              placeholder="输入推流密钥..."
              className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        {/* Video Bitrate */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Video size={12} />
            视频码率
          </label>
          <select
            value={localConfig.videoBitrate}
            onChange={(e) => handleChange('videoBitrate', e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {VIDEO_BITRATES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Resolution */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Monitor size={12} />
            分辨率
          </label>
          <select
            value={localConfig.resolution}
            onChange={(e) => handleChange('resolution', e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {RESOLUTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* FPS */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Gauge size={12} />
            帧率
          </label>
          <select
            value={localConfig.fps}
            onChange={(e) => handleChange('fps', parseInt(e.target.value))}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {FPS_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Bitrate */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Headphones size={12} />
            音频码率
          </label>
          <select
            value={localConfig.audioBitrate}
            onChange={(e) => handleChange('audioBitrate', e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {AUDIO_BITRATES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* FFmpeg path */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <FileCode size={12} />
            FFmpeg 路径 (可选)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              placeholder="使用系统 PATH 中的 FFmpeg"
              className="flex-1 rounded-lg bg-slate-700/50 border border-slate-600 px-3 py-2 text-sm text-slate-300 placeholder-slate-500 cursor-not-allowed transition-all"
            />
            <button
              onClick={selectFFmpegPath}
              className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
            >
              <FolderOpen size={12} />
              浏览
            </button>
          </div>
          <p className="text-[10px] text-slate-500">留空将使用系统环境变量 PATH 中的 FFmpeg</p>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 space-y-1">
            {validationErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} />
                {err}
              </div>
            ))}
          </div>
        )}
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

export default FFmpegSettings;
