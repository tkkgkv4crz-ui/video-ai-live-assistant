import type { StreamStatus, StreamStats } from '@/shared/types';
import { IPCChannels } from '@/shared/ipc-channels';

const defaultStreamStatus: StreamStatus = {
  state: 'idle',
  duration: 0,
};

const defaultStreamStats: StreamStats = {
  totalFrames: 0,
  droppedFrames: 0,
  avgBitrate: 0,
  uptime: 0,
};

class StreamService {
  private status: StreamStatus;
  private stats: StreamStats;
  private statusChangeCallbacks: Set<(status: StreamStatus) => void>;
  private statsUpdateCallbacks: Set<(stats: StreamStats) => void>;
  private durationInterval: ReturnType<typeof setInterval> | null;
  private onStatusChangeHandler: ((status: StreamStatus) => void) | null;
  private onStatsUpdateHandler: ((stats: StreamStats) => void) | null;

  constructor() {
    this.status = { ...defaultStreamStatus };
    this.stats = { ...defaultStreamStats };
    this.statusChangeCallbacks = new Set();
    this.statsUpdateCallbacks = new Set();
    this.durationInterval = null;
    this.onStatusChangeHandler = null;
    this.onStatsUpdateHandler = null;

    this.setupIpcListeners();
  }

  private setupIpcListeners(): void {
    // Listen for stream status updates from main process
    if (typeof window !== 'undefined' && window.electronAPI) {
      this.onStatusChangeHandler = (status: StreamStatus) => {
        this.status = { ...this.status, ...status };
        this.notifyStatusChange();
      };

      this.onStatsUpdateHandler = (stats: StreamStats) => {
        this.stats = { ...this.stats, ...stats };
        this.notifyStatsUpdate();
      };

      window.electronAPI.onStreamStatus(this.onStatusChangeHandler);
      window.electronAPI.onStreamStats(this.onStatsUpdateHandler);
    }
  }

  // Start streaming (called by store after IPC invocation)
  start(): void {
    this.status = {
      state: 'streaming',
      startTime: Date.now(),
      duration: 0,
    };
    this.stats = { ...defaultStreamStats };
    this.notifyStatusChange();
    this.notifyStatsUpdate();

    // Start duration timer
    this.startDurationTimer();
  }

  // Stop streaming (called by store after IPC invocation)
  stop(): void {
    this.stopDurationTimer();
    this.status = { ...defaultStreamStatus };
    this.stats = { ...defaultStreamStats };
    this.notifyStatusChange();
    this.notifyStatsUpdate();
  }

  // Set error state
  setError(errorMsg: string): void {
    this.status = {
      ...this.status,
      state: 'error',
      error: errorMsg,
    };
    this.notifyStatusChange();
  }

  // Set connecting state
  setConnecting(): void {
    this.status = {
      state: 'connecting',
      duration: 0,
    };
    this.stats = { ...defaultStreamStats };
    this.notifyStatusChange();
    this.notifyStatsUpdate();
  }

  // Set stopping state
  setStopping(): void {
    this.status = {
      ...this.status,
      state: 'stopping',
    };
    this.notifyStatusChange();
  }

  // Get current status
  getStatus(): StreamStatus {
    return { ...this.status };
  }

  // Get current stats
  getStats(): StreamStats {
    return { ...this.stats };
  }

  // Event listener for status changes
  onStatusChange(callback: (status: StreamStatus) => void): () => void {
    this.statusChangeCallbacks.add(callback);
    // Immediately call with current status
    callback({ ...this.status });
    return () => {
      this.statusChangeCallbacks.delete(callback);
    };
  }

  // Event listener for stats updates
  onStatsUpdate(callback: (stats: StreamStats) => void): () => void {
    this.statsUpdateCallbacks.add(callback);
    // Immediately call with current stats
    callback({ ...this.stats });
    return () => {
      this.statsUpdateCallbacks.delete(callback);
    };
  }

  // Format duration to HH:MM:SS
  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  }

  // Cleanup (call on app unmount)
  destroy(): void {
    this.stopDurationTimer();
    this.statusChangeCallbacks.clear();
    this.statsUpdateCallbacks.clear();

    // IPC listeners are auto-managed by preload, no manual cleanup needed
    // The preload script handles removeAllListeners on re-registration
  }

  private startDurationTimer(): void {
    this.stopDurationTimer();
    this.durationInterval = setInterval(() => {
      if (this.status.state === 'streaming' && this.status.startTime) {
        const duration = Math.floor((Date.now() - this.status.startTime) / 1000);
        this.status = { ...this.status, duration };
        this.stats = { ...this.stats, uptime: duration };
        this.notifyStatusChange();
        this.notifyStatsUpdate();
      }
    }, 1000);
  }

  private stopDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  private notifyStatusChange(): void {
    const status = { ...this.status };
    this.statusChangeCallbacks.forEach((cb) => cb(status));
  }

  private notifyStatsUpdate(): void {
    const stats = { ...this.stats };
    this.statsUpdateCallbacks.forEach((cb) => cb(stats));
  }
}

export const streamService = new StreamService();
