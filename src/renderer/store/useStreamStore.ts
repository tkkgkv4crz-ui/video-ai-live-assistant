import { create } from 'zustand';
import type { FFmpegConfig, StreamStatus, StreamStats } from '@/shared/types';
import { IPCChannels } from '@/shared/ipc-channels';
import { streamService } from '@/renderer/services/stream-service';

const defaultFFmpegConfig: FFmpegConfig = {
  rtmpUrl: '',
  streamKey: '',
  videoBitrate: '3000k',
  audioBitrate: '128k',
  resolution: '1280x720',
  fps: 30,
};

interface StreamState {
  status: StreamStatus;
  stats: StreamStats;
  config: FFmpegConfig;
  isCanvasVisible: boolean;

  setConfig: (config: Partial<FFmpegConfig>) => void;
  startStream: () => Promise<void>;
  stopStream: () => Promise<void>;
  updateStatus: (status: Partial<StreamStatus>) => void;
  updateStats: (stats: Partial<StreamStats>) => void;
  setCanvasVisible: (v: boolean) => void;
}

export const useStreamStore = create<StreamState>((set, get) => {
  const unsubStatus = streamService.onStatusChange((status) => {
    set({ status });
  });

  const unsubStats = streamService.onStatsUpdate((stats) => {
    set({ stats });
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      unsubStatus();
      unsubStats();
    });
  }

  return {
    status: { state: 'idle', duration: 0 },
    stats: { totalFrames: 0, droppedFrames: 0, avgBitrate: 0, uptime: 0 },
    config: { ...defaultFFmpegConfig },
    isCanvasVisible: true,

    setConfig: (partial) =>
      set((state) => ({
        config: { ...state.config, ...partial },
      })),

    startStream: async () => {
      const { config } = get();
      if (!config.rtmpUrl || !config.streamKey) {
        throw new Error('请配置RTMP推流地址和流密钥');
      }

      streamService.setConnecting();

      try {
        await window.electronAPI.startStream(config);
        streamService.start();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '推流启动失败';
        streamService.setError(errorMsg);
        throw error;
      }
    },

    stopStream: async () => {
      streamService.setStopping();

      try {
        await window.electronAPI.stopStream();
      } catch {
        // Even if IPC fails, force stop
      }

      streamService.stop();
    },

    updateStatus: (partial) =>
      set((state) => ({
        status: { ...state.status, ...partial },
      })),

    updateStats: (partial) =>
      set((state) => ({
        stats: { ...state.stats, ...partial },
      })),

    setCanvasVisible: (v) => set({ isCanvasVisible: v }),
  };
});
