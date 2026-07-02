import { app, ipcMain, dialog, shell, Notification } from 'electron';
import { IPCChannels } from '../src/shared/ipc-channels';
import type { AppSettings, FFmpegConfig } from '../src/shared/types';
import { WindowManager } from './window-manager';
import { FFmpegManager } from './ffmpeg-manager';
import { StoreManager } from './store-manager';

let windowManager: WindowManager;
let ffmpegManager: FFmpegManager;
let storeManager: StoreManager;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function logToRenderer(level: 'debug' | 'info' | 'warn' | 'error' | 'success', message: string, source = 'Main'): void {
  if (!windowManager) return;
  windowManager.sendToRenderer(IPCChannels.LOG_MESSAGE, {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level,
    message,
    timestamp: Date.now(),
    source,
  });
}

function initializeIPC(): void {
  // ==================== Stream IPC ====================
  ipcMain.handle(IPCChannels.START_STREAM, async (_, config: FFmpegConfig) => {
    try {
      logToRenderer('info', '正在启动推流...', 'Stream');
      await ffmpegManager.startStream(config);
      logToRenderer('success', '推流已启动', 'Stream');
      return { success: true, message: '推流已启动' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知错误';
      logToRenderer('error', `推流启动失败: ${errMsg}`, 'Stream');
      return { success: false, message: '推流启动失败', error: errMsg };
    }
  });

  ipcMain.handle(IPCChannels.STOP_STREAM, async () => {
    try {
      logToRenderer('info', '正在停止推流...', 'Stream');
      await ffmpegManager.stopStream();
      logToRenderer('success', '推流已停止', 'Stream');
      return { success: true, message: '推流已停止' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知错误';
      logToRenderer('error', `停止推流失败: ${errMsg}`, 'Stream');
      return { success: false, message: '停止推流失败', error: errMsg };
    }
  });

  // ==================== Settings IPC ====================
  ipcMain.handle(IPCChannels.SAVE_SETTINGS, (_, settings: AppSettings) => {
    try {
      storeManager.set('settings', settings);
      logToRenderer('success', '设置已保存', 'Settings');
      return { success: true, message: '设置已保存' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知错误';
      logToRenderer('error', `保存设置失败: ${errMsg}`, 'Settings');
      return { success: false, message: '保存设置失败', error: errMsg };
    }
  });

  ipcMain.handle(IPCChannels.LOAD_SETTINGS, () => {
    try {
      const settings = storeManager.get('settings') as AppSettings;
      logToRenderer('info', '设置已加载', 'Settings');
      return { success: true, data: settings };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知错误';
      logToRenderer('error', `加载设置失败: ${errMsg}`, 'Settings');
      return { success: false, message: '加载设置失败', error: errMsg };
    }
  });

  // ==================== TTS IPC ====================
  ipcMain.handle(IPCChannels.TTS_SPEAK, (_, text: string) => {
    windowManager.sendToRenderer(IPCChannels.TTS_STATE_CHANGED, { state: 'speaking', text });
    return { success: true };
  });

  ipcMain.handle(IPCChannels.TTS_STOP, () => {
    windowManager.sendToRenderer(IPCChannels.TTS_STATE_CHANGED, { state: 'idle' });
    return { success: true };
  });

  ipcMain.handle(IPCChannels.TTS_PAUSE, () => {
    windowManager.sendToRenderer(IPCChannels.TTS_STATE_CHANGED, { state: 'paused' });
    return { success: true };
  });

  ipcMain.handle(IPCChannels.TTS_RESUME, () => {
    windowManager.sendToRenderer(IPCChannels.TTS_STATE_CHANGED, { state: 'speaking' });
    return { success: true };
  });

  // ==================== App IPC ====================
  ipcMain.handle(IPCChannels.GET_APP_VERSION, () => {
    return app.getVersion();
  });

  ipcMain.handle(IPCChannels.SHOW_NOTIFICATION, (_, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: undefined,
      }).show();
    }
    return { success: true };
  });

  ipcMain.handle(IPCChannels.OPEN_EXTERNAL, (_, url: string) => {
    shell.openExternal(url);
    return { success: true };
  });

  ipcMain.handle(IPCChannels.SELECT_FILE, async (_, filters?: Electron.FileFilter[]) => {
    const result = await dialog.showOpenDialog(windowManager.getMainWindow()!, {
      filters: filters || [{ name: 'All Files', extensions: ['*'] }],
      properties: ['openFile'],
    });
    return result.filePaths[0] || null;
  });
}

async function initialize(): Promise<void> {
  // Initialize managers
  storeManager = new StoreManager();
  ffmpegManager = new FFmpegManager(
    (status) => {
      windowManager?.sendToRenderer(IPCChannels.STREAM_STATUS_CHANGED, status);
    },
    (stats) => {
      windowManager?.sendToRenderer(IPCChannels.STREAM_STATS_UPDATE, stats);
    },
    (level, message) => {
      logToRenderer(level, message, 'FFmpeg');
    }
  );
  windowManager = new WindowManager(isDev);

  // Create main window
  await windowManager.createWindow();

  // Initialize IPC handlers
  initializeIPC();

  // Send loaded settings to renderer
  const settings = storeManager.get('settings') as AppSettings;
  setTimeout(() => {
    windowManager.sendToRenderer(IPCChannels.SETTINGS_LOADED, settings);
    logToRenderer('info', '应用初始化完成', 'Main');
  }, 1000);
}

// ==================== App Lifecycle ====================
app.whenReady().then(async () => {
  await initialize();

  app.on('activate', async () => {
    if (windowManager && !windowManager.hasWindow()) {
      await windowManager.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    ffmpegManager?.dispose();
    app.quit();
  }
});

app.on('before-quit', () => {
  ffmpegManager?.dispose();
});

app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
