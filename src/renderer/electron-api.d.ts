// Type declarations for Electron Preload API
// This file declares the global window.electronAPI injected by the preload script

import type { AppSettings, FFmpegConfig, StreamStatus, StreamStats, TTSState, LogEntry } from './services/ai-service';

export interface ElectronAPI {
  // Stream
  startStream: (config: FFmpegConfig) => Promise<{ success: boolean; message: string; error?: string }>;
  stopStream: () => Promise<{ success: boolean; message: string; error?: string }>;
  onStreamStatus: (callback: (status: StreamStatus) => void) => void;
  onStreamStats: (callback: (stats: StreamStats) => void) => void;

  // Settings
  saveSettings: (settings: AppSettings) => Promise<{ success: boolean; message: string; error?: string }>;
  loadSettings: () => Promise<{ success: boolean; data?: AppSettings; message?: string; error?: string }>;
  onSettingsLoaded: (callback: (settings: AppSettings) => void) => void;

  // TTS
  speakTTS: (text: string) => Promise<{ success: boolean }>;
  stopTTS: () => Promise<{ success: boolean }>;
  pauseTTS: () => Promise<{ success: boolean }>;
  resumeTTS: () => Promise<{ success: boolean }>;
  onTTSStateChange: (callback: (state: { state: TTSState; text?: string }) => void) => void;

  // Log
  onLogMessage: (callback: (log: LogEntry) => void) => void;

  // App
  getVersion: () => Promise<string>;
  showNotification: (title: string, body: string) => Promise<{ success: boolean }>;
  openExternal: (url: string) => Promise<{ success: boolean }>;
  selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
