# 视频号AI直播助手

一款基于 Electron 的桌面应用程序，实现视频号无人值守AI自动直播。

## 功能特性

- **AI自动直播**：基于大语言模型自动生成直播内容，自动回复弹幕
- **声音克隆**：支持上传参考音频进行AI声音克隆，让直播声音更个性化
- **语音合成**：自动将AI生成的文字内容转为语音播报
- **直播画面合成**：自定义背景、字幕样式、装饰元素，实时预览直播画面
- **RTMP推流**：一键推流到视频号直播平台
- **弹幕互动**：自动读取弹幕并触发AI回复

## 技术栈

- **桌面框架**：Electron 28+
- **前端框架**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **推流引擎**：FFmpeg
- **AI对话**：OpenAI 兼容 API
- **语音合成**：Web Speech API + 声音克隆

## 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建应用
npm run build

# 构建 Windows 版本
npm run build:win

# 构建 macOS 版本
npm run build:mac

# 构建 Linux 版本
npm run build:linux
```

## 使用说明

1. **配置AI**：在「AI对话配置」页面设置API Key和模型参数，编辑直播人设
2. **配置语音**：在「语音合成配置」页面选择语音、调节参数，或上传参考音频进行声音克隆
3. **编辑场景**：在「场景编辑」页面自定义直播画面的背景、字幕和装饰元素
4. **配置推流**：在「推流配置」页面填入视频号的RTMP地址和推流密钥
5. **开始直播**：在主控制台点击「开始直播」按钮

## 项目结构

```
video-ai-live-assistant/
├── electron/                  # Electron 主进程
│   ├── main.ts               # 主进程入口
│   ├── preload.ts            # 预加载脚本（IPC桥接）
│   ├── ffmpeg-manager.ts     # FFmpeg 进程管理
│   ├── store-manager.ts      # 配置存储管理
│   └── window-manager.ts     # 窗口管理
├── src/
│   ├── shared/               # 共享类型和常量
│   │   ├── types.ts          # TypeScript 类型定义
│   │   └── ipc-channels.ts   # IPC 通道常量
│   └── renderer/             # 渲染进程
│       ├── main.tsx          # 渲染进程入口
│       ├── App.tsx           # 根组件
│       ├── index.css         # 全局样式
│       ├── components/       # 组件
│       │   ├── layout/       # 布局组件
│       │   ├── common/       # 通用UI组件
│       │   ├── ai/           # AI对话组件
│       │   ├── tts/          # 语音合成组件
│       │   ├── canvas/       # 直播画面渲染组件
│       │   └── stream/       # 推流控制组件
│       ├── pages/            # 页面
│       ├── services/         # 服务层
│       └── store/            # Zustand 状态管理
└── package.json
```

## 注意事项

- 使用前需要自行准备 OpenAI API Key 或兼容的API服务
- 推流功能依赖 FFmpeg，请确保系统已安装 FFmpeg
- 声音克隆功能需要上传清晰的参考音频（建议5-10秒）
- RTMP推流地址和密钥从微信视频号直播后台获取

## License

MIT
