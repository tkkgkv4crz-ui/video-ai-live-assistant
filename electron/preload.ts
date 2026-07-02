import { contextBridge, ipcRenderer } from 'electron';
import { IPCChannels } from '../src/shared/ipc-channels';
import type {
  AppSettings,
  FFmpegConfig,
  StreamStatus,
  StreamStats,
  TTSState,
  LogEntry,
} from '../src/shared/types';

// ==================== Stream API ====================
const startStream = (config: FFmpegConfig): Promise<{ success: boolean; message: string; error?: string }> =>
  ipcRenderer.invoke(IPCChannels.START_STREAM, config);

const stopStream = (): Promise<{ success: boolean; message: string; error?: string }> =>
  ipcRenderer.invoke(IPCChannels.STOP_STREAM);

const onStreamStatus = (callback: (status: StreamStatus) => void): void => {
  ipcRenderer.removeAllListeners(IPCChannels.STREAM_STATUS_CHANGED);
  ipcRenderer.on(IPCChannels.STREAM_STATUS_CHANGED, (_, status: StreamStatus) => {
    callback(status);
  });
};

const onStreamStats = (callback: (stats: StreamStats) => void): void => {
  ipcRenderer.removeAllListeners(IPCChannels.STREAM_STATS_UPDATE);
  ipcRenderer.on(IPCChannels.STREAM_STATS_UPDATE, (_, stats: StreamStats) => {
    callback(stats);
  });
};

// ==================== Settings API ====================
const saveSettings = (settings: AppSettings): Promise<{ success: boolean; message: string; error?: string }> =>
  ipcRenderer.invoke(IPCChannels.SAVE_SETTINGS, settings);

const loadSettings = (): Promise<{ success: boolean; data?: AppSettings; message?: string; error?: string }> =>
  ipcRenderer.invoke(IPCChannels.LOAD_SETTINGS);

const onSettingsLoaded = (callback: (settings: AppSettings) => void): void => {
  ipcRenderer.removeAllListeners(IPCChannels.SETTINGS_LOADED);
  ipcRenderer.on(IPCChannels.SETTINGS_LOADED, (_, settings: AppSettings) => {
    callback(settings);
  });
};

// ==================== TTS API ====================
const speakTTS = (text: string): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.TTS_SPEAK, text);

const stopTTS = (): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.TTS_STOP);

const pauseTTS = (): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.TTS_PAUSE);

const resumeTTS = (): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.TTS_RESUME);

const onTTSStateChange = (callback: (state: { state: TTSState; text?: string }) => void): void => {
  ipcRenderer.removeAllListeners(IPCChannels.TTS_STATE_CHANGED);
  ipcRenderer.on(IPCChannels.TTS_STATE_CHANGED, (_, payload) => {
    callback(payload);
  });
};

// ==================== Log API ====================
const onLogMessage = (callback: (log: LogEntry) => void): void => {
  ipcRenderer.removeAllListeners(IPCChannels.LOG_MESSAGE);
  ipcRenderer.on(IPCChannels.LOG_MESSAGE, (_, log: LogEntry) => {
    callback(log);
  });
};

// ==================== App API ====================
const getVersion = (): Promise<string> =>
  ipcRenderer.invoke(IPCChannels.GET_APP_VERSION);

const showNotification = (title: string, body: string): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.SHOW_NOTIFICATION, title, body);

const openExternal = (url: string): Promise<{ success: boolean }> =>
  ipcRenderer.invoke(IPCChannels.OPEN_EXTERNAL, url);

const selectFile = (filters?: Electron.FileFilter[]): Promise<string | null> =>
  ipcRenderer.invoke(IPCChannels.SELECT_FILE, filters);

const removeAllListeners = (channel: IPCChannels): void => {
  ipcRenderer.removeAllListeners(channel);
};

// ==================== Expose API ====================
export interface ElectronAPI {
  // Stream
  startStream: typeof startStream;
  stopStream: typeof stopStream;
  onStreamStatus: typeof onStreamStatus;
  onStreamStats: typeof onStreamStats;
  // Settings
  saveSettings: typeof saveSettings;
  loadSettings: typeof loadSettings;
  onSettingsLoaded: typeof onSettingsLoaded;
  // TTS
  speakTTS: typeof speakTTS;
  stopTTS: typeof stopTTS;
  pauseTTS: typeof pauseTTS;
  resumeTTS: typeof resumeTTS;
  onTTSStateChange: typeof onTTSStateChange;
  // Log
  onLogMessage: typeof onLogMessage;
  // App
  getVersion: typeof getVersion;
  showNotification: typeof showNotification;
  openExternal: typeof openExternal;
  selectFile: typeof selectFile;
  removeAllListeners: typeof removeAllListeners;
}

const electronAPI: ElectronAPI = {
  // Stream
  startStream,
  stopStream,
  onStreamStatus,
  onStreamStats,
  // Settings
  saveSettings,
  loadSettings,
  onSettingsLoaded,
  // TTS
  speakTTS,
  stopTTS,
  pauseTTS,
  resumeTTS,
  onTTSStateChange,
  // Log
  onLogMessage,
  // App
  getVersion,
  showNotification,
  openExternal,
  selectFile,
  removeAllListeners,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript global declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
