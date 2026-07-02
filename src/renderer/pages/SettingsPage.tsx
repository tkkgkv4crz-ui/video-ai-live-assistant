import React, { useState } from 'react'
import {
  Settings,
  Monitor,
  ScrollText,
  Power,
  Minimize2,
  Info,
  Github,
  Heart,
} from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import Button from '@/renderer/components/common/Button'
import Select from '@/renderer/components/common/Select'
import Toggle from '@/renderer/components/common/Toggle'
import type { GeneralConfig } from '@/shared/types'

/* ── Options ── */
const themeOptions = [
  { value: 'dark', label: '深色主题' },
  { value: 'light', label: '浅色主题' },
  { value: 'system', label: '跟随系统' },
]

const logLevelOptions = [
  { value: 'debug', label: 'Debug (调试)' },
  { value: 'info', label: 'Info (信息)' },
  { value: 'warn', label: 'Warn (警告)' },
  { value: 'error', label: 'Error (错误)' },
]

/* ── Component ── */
const SettingsPage: React.FC = () => {
  const [general, setGeneral] = useState<GeneralConfig>({
    theme: 'dark',
    logLevel: 'info',
    autoStart: false,
    minimizeToTray: true,
  })

  const updateGeneral = (partial: Partial<GeneralConfig>) => {
    setGeneral((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    alert('设置已保存')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-100">系统设置</h2>
        </div>
        <Button variant="primary" onClick={handleSave}>
          保存设置
        </Button>
      </div>

      {/* Appearance */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">外观</span>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="主题"
            options={themeOptions}
            value={general.theme}
            onChange={(e) =>
              updateGeneral({
                theme: e.target.value as GeneralConfig['theme'],
              })
            }
          />
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-lg border-2 transition-all ${
                general.theme === 'dark'
                  ? 'border-indigo-500 bg-slate-800'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              <div className="w-full h-full flex flex-col p-1.5 gap-1">
                <div className="h-2 bg-slate-700 rounded-sm" />
                <div className="flex-1 bg-slate-700/50 rounded-sm" />
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-lg border-2 transition-all ${
                general.theme === 'light'
                  ? 'border-indigo-500 bg-gray-100'
                  : 'border-slate-700 bg-gray-100'
              }`}
            >
              <div className="w-full h-full flex flex-col p-1.5 gap-1">
                <div className="h-2 bg-gray-300 rounded-sm" />
                <div className="flex-1 bg-gray-200 rounded-sm" />
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-lg border-2 transition-all ${
                general.theme === 'system'
                  ? 'border-indigo-500 bg-gradient-to-br from-slate-800 to-gray-100'
                  : 'border-slate-700 bg-gradient-to-br from-slate-800 to-gray-100'
              }`}
            >
              <div className="w-full h-full flex flex-col p-1.5 gap-1">
                <div className="h-2 bg-slate-500/50 rounded-sm" />
                <div className="flex-1 bg-slate-500/30 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Logging */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">日志</span>
          </div>
        }
      >
        <Select
          label="日志级别"
          options={logLevelOptions}
          value={general.logLevel}
          onChange={(e) =>
            updateGeneral({
              logLevel: e.target.value as GeneralConfig['logLevel'],
            })
          }
        />
        <p className="text-xs text-slate-500 mt-1">
          低于此级别的日志将不会显示
        </p>
      </Card>

      {/* Startup */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">启动</span>
          </div>
        }
      >
        <div className="space-y-4">
          <Toggle
            label="开机自动启动"
            checked={general.autoStart}
            onChange={(v) => updateGeneral({ autoStart: v })}
          />
          <Toggle
            label="最小化到系统托盘"
            checked={general.minimizeToTray}
            onChange={(v) => updateGeneral({ minimizeToTray: v })}
          />
        </div>
      </Card>

      {/* About */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">关于</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                视频号AI直播助手
              </h3>
              <p className="text-sm text-slate-400">Video AI Live Assistant</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">版本号</span>
              <span className="text-slate-300 font-mono">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Electron</span>
              <span className="text-slate-300 font-mono">v28.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">React</span>
              <span className="text-slate-300 font-mono">v18.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">开发者</span>
              <span className="text-slate-300">AI Assistant Team</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
            <span className="text-xs text-slate-600 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400" /> by AI Team
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
