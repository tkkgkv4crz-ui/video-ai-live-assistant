import React, { useState } from 'react'
import { Radio, Link, Key, Monitor, Gauge, AudioLines, Terminal, Save } from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import Button from '@/renderer/components/common/Button'
import Input from '@/renderer/components/common/Input'
import Select from '@/renderer/components/common/Select'
import FFmpegSettings from '@/renderer/components/stream/FFmpegSettings'
import type { FFmpegConfig } from '@/shared/types'

const resolutionOptions = [
  { value: '1920x1080', label: '1920x1080 (1080p)' },
  { value: '1280x720', label: '1280x720 (720p)' },
  { value: '854x480', label: '854x480 (480p)' },
  { value: '640x360', label: '640x360 (360p)' },
]

const videoBitrateOptions = [
  { value: '8000k', label: '8000 kbps (高质量)' },
  { value: '5000k', label: '5000 kbps' },
  { value: '3000k', label: '3000 kbps (推荐)' },
  { value: '2000k', label: '2000 kbps' },
  { value: '1000k', label: '1000 kbps (低带宽)' },
]

const fpsOptions = [
  { value: '60', label: '60 fps' },
  { value: '30', label: '30 fps (推荐)' },
  { value: '24', label: '24 fps' },
]

const audioBitrateOptions = [
  { value: '192k', label: '192 kbps (高质量)' },
  { value: '128k', label: '128 kbps (推荐)' },
  { value: '64k', label: '64 kbps' },
]

const StreamConfigPage: React.FC = () => {
  const [config, setConfig] = useState<FFmpegConfig>({
    rtmpUrl: '',
    streamKey: '',
    videoBitrate: '3000k',
    audioBitrate: '128k',
    resolution: '1280x720',
    fps: 30,
  })
  const [advancedMode, setAdvancedMode] = useState(false)
  const [customArgs, setCustomArgs] = useState('')

  const handleSave = () => {
    console.log('Saving stream config:', config)
  }

  const generateFFmpegCommand = (): string => {
    return `ffmpeg -f avfoundation -i "1:0" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v ${config.videoBitrate} -s ${config.resolution} -r ${config.fps} -acodec aac -b:a ${config.audioBitrate} -f flv ${config.rtmpUrl}/${config.streamKey}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">推流配置</h1>
            <p className="text-sm text-slate-400">配置视频号RTMP推流参数</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          保存配置
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Basic Settings */}
        <div className="space-y-6">
          {/* RTMP Settings */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-green-400" />
                <h2 className="text-base font-medium text-slate-200">RTMP 设置</h2>
              </div>

              <Input
                label="RTMP 服务器地址"
                value={config.rtmpUrl}
                onChange={(e) => setConfig({ ...config, rtmpUrl: e.target.value })}
                placeholder="rtmp://livepush.weixin.qq.com/live/"
              />

              <Input
                label="推流密钥 (Stream Key)"
                type="password"
                value={config.streamKey}
                onChange={(e) => setConfig({ ...config, streamKey: e.target.value })}
                placeholder="从视频号直播后台获取"
              />

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-400">
                  提示：RTMP地址和推流密钥可从微信视频号直播后台「开播设置」中获取。
                </p>
              </div>
            </div>
          </Card>

          {/* Video Parameters */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-green-400" />
                <h2 className="text-base font-medium text-slate-200">视频参数</h2>
              </div>

              <Select
                label="分辨率"
                value={config.resolution}
                onChange={(e) => setConfig({ ...config, resolution: e.target.value })}
                options={resolutionOptions}
              />

              <Select
                label="视频码率"
                value={config.videoBitrate}
                onChange={(e) => setConfig({ ...config, videoBitrate: e.target.value })}
                options={videoBitrateOptions}
              />

              <Select
                label="帧率"
                value={config.fps.toString()}
                onChange={(e) => setConfig({ ...config, fps: parseInt(e.target.value) })}
                options={fpsOptions}
              />
            </div>
          </Card>

          {/* Audio Parameters */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AudioLines className="w-4 h-4 text-green-400" />
                <h2 className="text-base font-medium text-slate-200">音频参数</h2>
              </div>

              <Select
                label="音频码率"
                value={config.audioBitrate}
                onChange={(e) => setConfig({ ...config, audioBitrate: e.target.value })}
                options={audioBitrateOptions}
              />
            </div>
          </Card>
        </div>

        {/* Right: FFmpeg Settings + Command Preview */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <FFmpegSettings />
            </div>
          </Card>

          {/* Command Preview */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h2 className="text-base font-medium text-slate-200">FFmpeg 命令预览</h2>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <code className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap">
                  {generateFFmpegCommand()}
                </code>
              </div>

              <p className="text-xs text-slate-500">
                此命令仅供参考，实际推流由应用自动管理。
              </p>
            </div>
          </Card>

          {/* Quick Guide */}
          <Card>
            <div className="p-6 space-y-3">
              <h2 className="text-base font-medium text-slate-200">视频号开播指南</h2>
              <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
                <li>打开微信 → 发现 → 视频号</li>
                <li>点击右上角人像图标 → 发起直播</li>
                <li>选择「推流直播」模式</li>
                <li>复制RTMP地址和推流密钥</li>
                <li>粘贴到本页面对应输入框</li>
                <li>点击「开始直播」按钮</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StreamConfigPage
