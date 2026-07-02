// ==================== AI Chat Types ====================

export interface AIConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'product' | 'qa' | 'custom';
}

export interface LiveContext {
  currentTopic: string;
  viewerCount: number;
  recentComments: Comment[];
  currentSpeech: string;
}

export interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: number;
}

// ==================== TTS Types ====================

export interface TTSConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
  autoSpeak: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  lang: string;
  localService: string;
  gender: 'male' | 'female' | 'neutral';
  sampleAudio?: string;
  cloneModel?: string;
}

export type TTSState = 'idle' | 'speaking' | 'paused' | 'queued';

// ==================== Stream Types ====================

export interface FFmpegConfig {
  rtmpUrl: string;
  streamKey: string;
  videoBitrate: string;
  audioBitrate: string;
  resolution: string;
  fps: number;
}

export interface StreamStatus {
  state: 'idle' | 'connecting' | 'streaming' | 'error' | 'stopping';
  startTime?: number;
  duration: number;
  bitrate?: number;
  fps?: number;
  error?: string;
}

export interface StreamStats {
  totalFrames: number;
  droppedFrames: number;
  avgBitrate: number;
  uptime: number;
}

// ==================== Scene Types ====================

export interface SceneConfig {
  id: string;
  name: string;
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  subtitle: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'center';
    fontSize: number;
    fontColor: string;
    bgColor: string;
    bgOpacity: number;
  };
  overlays: OverlayElement[];
}

export interface OverlayElement {
  id: string;
  type: 'text' | 'image' | 'clock' | 'qr';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: React.CSSProperties;
}

// ==================== App Types ====================

export interface AppSettings {
  ffmpeg: FFmpegConfig;
  ai: AIConfig;
  tts: TTSConfig;
  scene: SceneConfig;
  general: GeneralConfig;
}

export interface GeneralConfig {
  theme: 'dark' | 'light';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  autoStart: boolean;
  minimizeToTray: boolean;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: number;
  source?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// ==================== API Response Types ====================

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamCommandResult {
  success: boolean;
  message: string;
  error?: string;
}
