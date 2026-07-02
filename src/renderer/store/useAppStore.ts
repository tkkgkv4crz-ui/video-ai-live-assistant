import { create } from 'zustand';
import type { AppSettings, LogEntry } from '@/shared/types';
import { IPCChannels } from '@/shared/ipc-channels';

const defaultSettings: AppSettings = {
  ffmpeg: {
    rtmpUrl: '',
    streamKey: '',
    videoBitrate: '3000k',
    audioBitrate: '128k',
    resolution: '1280x720',
    fps: 30,
  },
  ai: {
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: '你是一个专业的直播主播，请用热情友好的语气与观众互动。',
  },
  tts: {
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
    autoSpeak: true,
  },
  scene: {
    id: 'default',
    name: '默认场景',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
    subtitle: {
      enabled: true,
      position: 'bottom',
      fontSize: 24,
      fontColor: '#f8fafc',
      bgColor: '#000000',
      bgOpacity: 0.6,
    },
    overlays: [],
  },
  general: {
    theme: 'dark',
    logLevel: 'info',
    autoStart: false,
    minimizeToTray: true,
  },
};

interface AppState {
  settings: AppSettings;
  isLoading: boolean;
  activeNav: string;
  logs: LogEntry[];

  setSettings: (settings: Partial<AppSettings>) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  setActiveNav: (nav: string) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: { ...defaultSettings },
  isLoading: false,
  activeNav: 'dashboard',
  logs: [],

  setSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const result = await window.electronAPI.loadSettings();
      if (result.success && result.data) {
        set((state) => ({
          settings: { ...state.settings, ...result.data },
        }));
        get().addLog({ level: 'success', message: '设置加载成功', source: 'AppStore' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载设置失败';
      get().addLog({ level: 'error', message, source: 'AppStore' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async () => {
    set({ isLoading: true });
    try {
      const { settings } = get();
      const result = await window.electronAPI.saveSettings(settings);
      if (result.success) {
        get().addLog({ level: 'success', message: '设置已保存', source: 'AppStore' });
      } else {
        get().addLog({ level: 'error', message: result.message || '保存失败', source: 'AppStore' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存设置失败';
      get().addLog({ level: 'error', message, source: 'AppStore' });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveNav: (nav) => set({ activeNav: nav }),

  addLog: (entry) => {
    const log: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    set((state) => ({
      logs: [...state.logs.slice(-499), log],
    }));
  },

  clearLogs: () => set({ logs: [] }),
}));
