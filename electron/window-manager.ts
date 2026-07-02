import { BrowserWindow, Tray, Menu, nativeImage, app, ipcMain } from 'electron';
import { join } from 'path';
import { IPCChannels } from '../src/shared/ipc-channels';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting = false;

  constructor(private devMode = false) {
    // Listen for minimize-to-tray IPC
    ipcMain.on('window:minimize-to-tray', () => {
      this.minimizeToTray();
    });
  }

  async createWindow(): Promise<BrowserWindow> {
    if (this.mainWindow) {
      this.mainWindow.focus();
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      title: '视频号AI直播助手',
      icon: this.getIcon(),
      show: false, // Show when ready-to-show for smooth loading
      darkTheme: true,
      backgroundColor: '#0f172a',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        sandbox: false,
      },
    });

    // Set up window event handlers
    this.setupWindowEvents();

    // Create tray icon
    this.createTray();

    // Load content
    if (this.devMode || isDev) {
      // Load from Vite dev server in development
      await this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      // Load built files in production
      await this.mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    return this.mainWindow;
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle close - minimize to tray instead of quitting
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.minimizeToTray();
      }
    });

    // Handle closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private createTray(): void {
    // Use a simple colored icon for now (can be replaced with actual icon)
    const icon = nativeImage.createFromNamedImage('NSActionTemplate', [16, 16]).resize({
      width: 16,
      height: 16,
    });

    this.tray = new Tray(icon);
    this.tray.setToolTip('视频号AI直播助手');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          this.showWindow();
        },
      },
      {
        label: '开始直播',
        click: () => {
          this.sendToRenderer(IPCChannels.LOG_MESSAGE, {
            id: `${Date.now()}-tray`,
            level: 'info',
            message: '通过托盘菜单启动直播',
            timestamp: Date.now(),
            source: 'Tray',
          });
        },
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          this.quitApp();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);

    // Double click to show window
    this.tray.on('double-click', () => {
      this.showWindow();
    });

    // Click to show window (macOS)
    this.tray.on('click', () => {
      this.showWindow();
    });
  }

  private getIcon(): Electron.NativeImage | undefined {
    try {
      // Try to use app icon, fallback to undefined
      return nativeImage.createFromNamedImage('NSActionTemplate', [32, 32]);
    } catch {
      return undefined;
    }
  }

  private minimizeToTray(): void {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  private showWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    } else {
      this.createWindow();
    }
  }

  private quitApp(): void {
    this.isQuitting = true;
    app.quit();
  }

  // Public API
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  hasWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed();
  }

  sendToRenderer(channel: IPCChannels, ...args: unknown[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  focusWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.focus();
    }
  }

  minimizeWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.minimize();
    }
  }

  maximizeWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    }
  }

  destroyTray(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
