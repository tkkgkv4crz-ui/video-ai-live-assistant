import { create } from 'zustand';
import type { TTSConfig, VoiceProfile, TTSState as TTSStateType } from '@/shared/types';
import { ttsService } from '@/renderer/services/tts-service';

const defaultTTSConfig: TTSConfig = {
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  enabled: true,
  autoSpeak: true,
};

interface TTSState {
  config: TTSConfig;
  voices: VoiceProfile[];
  availableVoices: SpeechSynthesisVoice[];
  currentState: TTSStateType;
  queue: string[];

  setConfig: (config: Partial<TTSConfig>) => void;
  setVoices: (voices: VoiceProfile[]) => void;
  setAvailableVoices: (voices: SpeechSynthesisVoice[]) => void;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  enqueue: (text: string) => void;
  clearQueue: () => void;
  setCurrentState: (state: TTSStateType) => void;
}

export const useTTSStore = create<TTSState>((set, get) => {
  const unsubscribe = ttsService.onStateChange((newState) => {
    set({ currentState: newState });
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', unsubscribe);
  }

  return {
    config: { ...defaultTTSConfig },
    voices: [],
    availableVoices: [],
    currentState: 'idle',
    queue: [],

    setConfig: (partial) =>
      set((state) => {
        const newConfig = { ...state.config, ...partial };
        ttsService.updateConfig(newConfig);
        return { config: newConfig };
      }),

    setVoices: (voices) => set({ voices }),

    setAvailableVoices: (voices) => {
      set({ availableVoices: voices });
      const state = get();
      if (!state.config.voice && voices.length > 0) {
        const defaultVoice = voices.find((v) => v.lang.startsWith('zh')) || voices[0];
        if (defaultVoice) {
          set((s) => ({
            config: { ...s.config, voice: defaultVoice.name },
          }));
          ttsService.updateConfig({ voice: defaultVoice.name });
        }
      }
    },

    speak: (text) => {
      const { config } = get();
      if (!config.enabled) return;
      ttsService.speak(text).catch(() => {
        // Error handled in service
      });
    },

    stop: () => {
      ttsService.stop();
      set({ queue: [] });
    },

    pause: () => {
      ttsService.pause();
    },

    resume: () => {
      ttsService.resume();
    },

    enqueue: (text) => {
      set((state) => ({
        queue: [...state.queue, text],
      }));
      const { config } = get();
      if (config.enabled && config.autoSpeak) {
        ttsService.speak(text).catch(() => {
          // Error handled in service
        });
      }
    },

    clearQueue: () => {
      ttsService.stop();
      set({ queue: [] });
    },

    setCurrentState: (newState) => set({ currentState: newState }),
  };
});
