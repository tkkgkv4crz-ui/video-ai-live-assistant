import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';
import type { FFmpegConfig, StreamStatus, StreamStats } from '../src/shared/types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export class FFmpegManager {
  private process: ChildProcess | null = null;
  private status: StreamStatus = {
    state: 'idle',
    duration: 0,
  };
  private stats: StreamStats = {
    totalFrames: 0,
    droppedFrames: 0,
    avgBitrate: 0,
    uptime: 0,
  };
  private statsInterval: NodeJS.Timeout | null = null;
  private durationInterval: NodeJS.Timeout | null = null;
  private startTime = 0;
  private recentBitrateValues: number[] = [];

  constructor(
    private onStatusChange: (status: StreamStatus) => void,
    private onStatsUpdate: (stats: StreamStats) => void,
    private onLog: (level: LogLevel, message: string) => void,
  ) {}

  private setStatus(status: Partial<StreamStatus>): void {
    this.status = { ...this.status, ...status };
    this.onStatusChange(this.status);
  }

  private setStats(stats: Partial<StreamStats>): void {
    this.stats = { ...this.stats, ...stats };
    this.onStatsUpdate(this.stats);
  }

  private getPlatformInput(): { format: string; input: string; audioInput?: string } {
    const osPlatform = platform();

    switch (osPlatform) {
      case 'darwin':
        // macOS: avfoundation, screen index 1, audio device 0
        return {
          format: 'avfoundation',
          input: '1:0',
        };
      case 'win32':
        // Windows: dshow or gdigrab
        return {
          format: 'dshow',
          input: 'video=screen-capture-recorder:audio=virtual-audio-capturer',
        };
      case 'linux':
        // Linux: x11grab + pulse
        return {
          format: 'x11grab',
          input: ':0.0',
          audioInput: 'default',
        };
      default:
        return {
          format: 'avfoundation',
          input: '1:0',
        };
    }
  }

  private buildFFmpegArgs(config: FFmpegConfig): string[] {
    const osPlatform = platform();
    const { format, input, audioInput } = this.getPlatformInput();
    const args: string[] = [];

    // Global flags
    args.push('-y'); // Overwrite output

    // Input configuration based on platform
    if (osPlatform === 'darwin') {
      args.push('-f', format);
      args.push('-i', input);
      args.push('-vsync', 'vfr');
    } else if (osPlatform === 'win32') {
      args.push('-f', format);
      args.push('-i', input);
      args.push('-framerate', `${config.fps}`);
    } else if (osPlatform === 'linux') {
      args.push('-f', format);
      args.push('-s', config.resolution);
      args.push('-r', `${config.fps}`);
      args.push('-i', input);
      if (audioInput) {
        args.push('-f', 'pulse');
        args.push('-i', audioInput);
      }
    }

    // Video codec settings
    args.push('-vcodec', 'libx264');
    args.push('-preset', 'ultrafast');
    args.push('-tune', 'zerolatency');
    args.push('-b:v', config.videoBitrate);
    args.push('-s', config.resolution);
    args.push('-r', `${config.fps}`);
    args.push('-pix_fmt', 'yuv420p');

    // Audio codec settings
    args.push('-acodec', 'aac');
    args.push('-b:a', config.audioBitrate);
    args.push('-ar', '44100');
    args.push('-ac', '2');

    // Output format and URL
    args.push('-f', 'flv');
    args.push(`${config.rtmpUrl}/${config.streamKey}`);

    return args;
  }

  private parseFFmpegOutput(data: string): void {
    // Parse frame information
    const frameMatch = data.match(/frame=\s*(\d+)/);
    if (frameMatch) {
      const totalFrames = parseInt(frameMatch[1], 10);
      this.setStats({ totalFrames });
    }

    // Parse FPS
    const fpsMatch = data.match(/fps=\s*([\d.]+)/);
    if (fpsMatch) {
      const fps = parseFloat(fpsMatch[1]);
      this.setStatus({ fps });
    }

    // Parse bitrate
    const bitrateMatch = data.match(/bitrate=\s*([\d.]+)(\w+)\/s/);
    if (bitrateMatch) {
      const value = parseFloat(bitrateMatch[1]);
      const unit = bitrateMatch[2];
      let kbps = value;
      if (unit === 'mbit') kbps = value * 1000;
      else if (unit === 'bit') kbps = value / 1000;

      this.recentBitrateValues.push(kbps);
      if (this.recentBitrateValues.length > 10) {
        this.recentBitrateValues.shift();
      }
      const avgBitrate = Math.round(
        this.recentBitrateValues.reduce((a, b) => a + b, 0) / this.recentBitrateValues.length
      );
      this.setStats({ avgBitrate });
      this.setStatus({ bitrate: Math.round(kbps) });
    }

    // Parse dropped frames
    const dropMatch = data.match(/drop=\s*(\d+)/);
    if (dropMatch) {
      const droppedFrames = parseInt(dropMatch[1], 10);
      this.setStats({ droppedFrames });
    }

    // Log FFmpeg output in development
    if (data.includes('error') || data.includes('Error')) {
      this.onLog('error', data.trim());
    } else {
      this.onLog('debug', data.trim());
    }
  }

  async startStream(config: FFmpegConfig): Promise<void> {
    if (this.process) {
      throw new Error('FFmpeg进程已在运行');
    }

    if (!config.rtmpUrl || !config.streamKey) {
      throw new Error('RTMP地址和流密钥不能为空');
    }

    this.recentBitrateValues = [];
    const args = this.buildFFmpegArgs(config);

    this.onLog('info', `FFmpeg命令: ffmpeg ${args.join(' ')}`);

    this.setStatus({
      state: 'connecting',
      duration: 0,
      bitrate: undefined,
      fps: undefined,
      error: undefined,
    });

    this.process = spawn('ffmpeg', args, {
      detached: false,
    });

    // Handle stdout (usually empty for FFmpeg)
    this.process.stdout?.on('data', (data: Buffer) => {
      this.onLog('debug', `stdout: ${data.toString().trim()}`);
    });

    // Handle stderr (FFmpeg outputs stats here)
    this.process.stderr?.on('data', (data: Buffer) => {
      this.parseFFmpegOutput(data.toString());
    });

    // Handle process exit
    this.process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        this.onLog('error', `FFmpeg进程异常退出，退出码: ${code}`);
        this.setStatus({
          state: 'error',
          error: `进程异常退出 (code: ${code})`,
        });
      } else {
        this.onLog('info', 'FFmpeg进程已退出');
      }
      this.cleanup();
    });

    this.process.on('error', (error) => {
      this.onLog('error', `FFmpeg进程错误: ${error.message}`);
      this.setStatus({
        state: 'error',
        error: error.message,
      });
      this.cleanup();
    });

    // Wait a moment to check if process started successfully
    await new Promise<void>((resolve, reject) => {
      if (!this.process) {
        reject(new Error('FFmpeg进程启动失败'));
        return;
      }

      const checkTimeout = setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.setStatus({ state: 'streaming', startTime: Date.now() });
          this.startTime = Date.now();
          this.startTimers();
          resolve();
        } else {
          reject(new Error('FFmpeg进程未能正常运行'));
        }
      }, 2000);

      this.process.on('exit', () => {
        clearTimeout(checkTimeout);
        reject(new Error('FFmpeg进程启动后立即退出'));
      });

      this.process.on('error', (error) => {
        clearTimeout(checkTimeout);
        reject(error);
      });
    });
  }

  async stopStream(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.setStatus({ state: 'stopping' });

    // Try graceful shutdown first with 'q' key
    if (this.process.stdin?.writable) {
      this.process.stdin.write('q');
    }

    // Wait a bit then force kill if needed
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGTERM');
        }
        resolve();
      }, 2000);
    });

    // Force kill if still running
    if (this.process && !this.process.killed) {
      this.process.kill('SIGKILL');
    }

    this.cleanup();
    this.setStatus({
      state: 'idle',
      duration: 0,
      bitrate: undefined,
      fps: undefined,
    });
    this.setStats({
      totalFrames: 0,
      droppedFrames: 0,
      avgBitrate: 0,
      uptime: 0,
    });
  }

  private startTimers(): void {
    // Duration timer
    this.durationInterval = setInterval(() => {
      if (this.startTime > 0) {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        this.setStats({ uptime });
        this.setStatus({ duration: uptime });
      }
    }, 1000);

    // Stats timer (every 5 seconds)
    this.statsInterval = setInterval(() => {
      if (this.status.state === 'streaming') {
        this.onLog('info', `推流中 - 帧率: ${this.status.fps || 0}fps, 码率: ${this.status.bitrate || 0}kbps, 时长: ${this.formatDuration(this.status.duration)}`);
      }
    }, 5000);
  }

  private stopTimers(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private cleanup(): void {
    this.stopTimers();
    this.process = null;
    this.startTime = 0;
  }

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getStatus(): StreamStatus {
    return this.status;
  }

  getStats(): StreamStats {
    return this.stats;
  }

  dispose(): void {
    this.stopStream().catch(() => {
      // Ignore errors during disposal
    });
  }
}
