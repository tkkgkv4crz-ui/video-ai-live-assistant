import React, { useState } from 'react'
import { Palette, Image, Type, Save } from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import Button from '@/renderer/components/common/Button'
import SceneEditor from '@/renderer/components/canvas/SceneEditor'
import type { SceneConfig } from '@/shared/types'

const defaultScene: SceneConfig = {
  id: 'default',
  name: '默认场景',
  background: {
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
  },
  subtitle: {
    enabled: true,
    position: 'bottom',
    fontSize: 24,
    fontColor: '#ffffff',
    bgColor: '#000000',
    bgOpacity: 0.6,
  },
  overlays: [
    {
      id: 'welcome',
      type: 'text',
      position: { x: 50, y: 30 },
      size: { width: 300, height: 40 },
      content: '欢迎来到直播间！',
      style: { fontSize: '18px', color: '#fbbf24', fontWeight: 'bold' },
    },
  ],
}

const SceneEditorPage: React.FC = () => {
  const [scene, setScene] = useState<SceneConfig>(defaultScene)

  const handleSave = () => {
    console.log('Saving scene:', scene)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">直播场景编辑</h1>
            <p className="text-sm text-slate-400">自定义直播画面的背景、字幕和装饰元素</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          保存场景
        </Button>
      </div>

      <SceneEditor
        initialScene={scene}
        onSave={(newScene) => setScene(newScene)}
      />
    </div>
  )
}

export default SceneEditorPage
