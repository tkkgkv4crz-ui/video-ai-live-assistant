import type { TTSConfig, VoiceProfile, TTSState } from '@/shared/types';

const defaultTTSConfig: TTSConfig = {
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  enabled: true,
  autoSpeak: true,
};

class TTSService {
  private config: TTSConfig;
  private synthesis: SpeechSynthesis;
  private queue: string[];
  private currentUtterance: SpeechSynthesisUtterance | null;
  private currentState: TTSState;
  private stateChangeCallbacks: Set<(state: TTSState) => void>;

  constructor() {
    this.config = { ...defaultTTSConfig };
    this.synthesis = window.speechSynthesis;
    this.queue = [];
    this.currentUtterance = null;
    this.currentState = 'idle';
    this.stateChangeCallbacks = new Set();
  }

  updateConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get all available voices from browser
  getVoices(): SpeechSynthesisVoice[] {
    const voices = this.synthesis.getVoices();
    return voices.sort((a, b) => {
      // Prioritize Chinese voices
      const aIsZh = a.lang.startsWith('zh');
      const bIsZh = b.lang.startsWith('zh');
      if (aIsZh && !bIsZh) return -1;
      if (!aIsZh && bIsZh) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Speak text
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.enabled) {
        resolve();
        return;
      }

      if (!text || text.trim().length === 0) {
        resolve();
        return;
      }

      // Cancel current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      this.currentUtterance = utterance;

      // Apply config
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Set voice
      if (this.config.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find((v) => v.name === this.config.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set language to Chinese by default
      utterance.lang = 'zh-CN';

      // Events
      utterance.onstart = () => {
        this.setState('speaking');
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) {
            this.setState('queued');
            this.speak(next).then(resolve).catch(reject);
            return;
          }
        }
        this.setState('idle');
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        this.setState('idle');
        if (event.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(`语音合成错误: ${event.error}`));
        }
      };

      utterance.onpause = () => {
        this.setState('paused');
      };

      utterance.onresume = () => {
        this.setState('speaking');
      };

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stop(): void {
    this.synthesis.cancel();
    this.queue = [];
    this.currentUtterance = null;
    this.setState('idle');
  }

  // Pause speaking
  pause(): void {
    this.synthesis.pause();
    if (this.currentState === 'speaking') {
      this.setState('paused');
    }
  }

  // Resume speaking
  resume(): void {
    this.synthesis.resume();
    if (this.currentState === 'paused') {
      this.setState('speaking');
    }
  }

  // Get current state
  getState(): TTSState {
    return this.currentState;
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.currentState === 'speaking';
  }

  // Get queue length
  getQueueLength(): number {
    return this.queue.length;
  }

  // Add to queue
  enqueue(text: string): void {
    this.queue.push(text);
    if (!this.isSpeaking() && this.currentState !== 'queued') {
      this.setState('queued');
    }
  }

  // Clear queue
  clearQueue(): void {
    this.queue = [];
    if (this.currentState === 'queued') {
      this.setState('idle');
    }
  }

  // Event listener for state changes
  onStateChange(callback: (state: TTSState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  // Create voice profile (placeholder for voice clone integration)
  async createVoiceProfile(_name: string, _sampleAudio: string): Promise<VoiceProfile> {
    // This is a placeholder for future voice clone service integration
    // Currently returns a basic profile based on selected voice
    const voices = this.getVoices();
    const selectedVoice = voices.find((v) => v.name === this.config.voice) || voices[0];

    return {
      id: crypto.randomUUID(),
      name: _name,
      description: `基于${selectedVoice?.name || '系统默认'}的语音配置`,
      lang: selectedVoice?.lang || 'zh-CN',
      localService: selectedVoice?.localService ? 'true' : 'false',
      gender: 'neutral',
      sampleAudio: _sampleAudio,
      cloneModel: undefined,
    };
  }

  private setState(state: TTSState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.stateChangeCallbacks.forEach((cb) => cb(state));
    }
  }
}

export const ttsService = new TTSService();
