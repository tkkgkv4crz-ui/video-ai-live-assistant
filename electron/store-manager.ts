import Store from 'electron-store';
import type { AppSettings, SceneConfig } from '../src/shared/types';

const defaultScene: SceneConfig = {
  id: 'default',
  name: '默认场景',
  background: {
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  subtitle: {
    enabled: true,
    position: 'bottom',
    fontSize: 24,
    fontColor: '#ffffff',
    bgColor: '#000000',
    bgOpacity: 0.6,
  },
  overlays: [],
};

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
    model: 'gpt-4o-mini',
    temperature: 0.8,
    maxTokens: 500,
    systemPrompt: '你是一位专业的直播主播，热情、专业、善于互动。请根据观众的问题和直播主题进行回答，保持内容有趣且有价值。',
  },
  tts: {
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
    autoSpeak: true,
  },
  scene: defaultScene,
  general: {
    theme: 'dark',
    logLevel: 'info',
    autoStart: false,
    minimizeToTray: true,
  },
};

type StoreSchema = {
  settings: AppSettings;
};

export class StoreManager {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'app-config',
      defaults: {
        settings: defaultSettings,
      },
    });
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
    return this.store.get(key);
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
    this.store.set(key, value);
  }

  getSettings(): AppSettings {
    return this.store.get('settings');
  }

  setSettings(settings: AppSettings): void {
    this.store.set('settings', settings);
  }

  getFFmpegConfig(): AppSettings['ffmpeg'] {
    return this.store.get('settings').ffmpeg;
  }

  getAIConfig(): AppSettings['ai'] {
    return this.store.get('settings').ai;
  }

  getTTSConfig(): AppSettings['tts'] {
    return this.store.get('settings').tts;
  }

  getSceneConfig(): AppSettings['scene'] {
    return this.store.get('settings').scene;
  }

  getGeneralConfig(): AppSettings['general'] {
    return this.store.get('settings').general;
  }

  resetToDefaults(): void {
    this.store.set('settings', defaultSettings);
  }

  clear(): void {
    this.store.clear();
  }
}
