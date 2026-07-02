import { create } from 'zustand';
import type { LogEntry } from '@/shared/types';

interface LogState {
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], message: string, source?: string) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [
    {
      id: 'init-1',
      level: 'info',
      message: '系统初始化完成',
      timestamp: Date.now(),
      source: 'app',
    },
    {
      id: 'init-2',
      level: 'info',
      message: '等待用户操作...',
      timestamp: Date.now(),
      source: 'app',
    },
  ],

  addLog: (level, message, source) =>
    set((state) => {
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        level,
        message,
        timestamp: Date.now(),
        source,
      };
      return {
        logs: [...state.logs.slice(-499), entry],
      };
    }),

  clearLogs: () => set({ logs: [] }),
}));
