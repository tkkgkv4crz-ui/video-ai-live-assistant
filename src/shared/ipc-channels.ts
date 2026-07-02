export enum IPCChannels {
  // Stream
  START_STREAM = 'stream:start',
  STOP_STREAM = 'stream:stop',
  GET_STREAM_STATUS = 'stream:status',
  STREAM_STATUS_CHANGED = 'stream:status-changed',
  STREAM_STATS_UPDATE = 'stream:stats-update',

  // Settings
  SAVE_SETTINGS = 'settings:save',
  LOAD_SETTINGS = 'settings:load',
  SETTINGS_LOADED = 'settings:loaded',

  // TTS
  TTS_SPEAK = 'tts:speak',
  TTS_STOP = 'tts:stop',
  TTS_PAUSE = 'tts:pause',
  TTS_RESUME = 'tts:resume',
  TTS_STATE_CHANGED = 'tts:state-changed',

  // Log
  LOG_MESSAGE = 'log:message',

  // App
  GET_APP_VERSION = 'app:version',
  SHOW_NOTIFICATION = 'app:notification',
  OPEN_EXTERNAL = 'app:open-external',
  SELECT_FILE = 'app:select-file',
}
