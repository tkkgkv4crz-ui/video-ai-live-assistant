import React from 'react'
import { Volume2, Save } from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import Button from '@/renderer/components/common/Button'
import VoiceSettings from '@/renderer/components/tts/VoiceSettings'
import VoiceCloneSetup from '@/renderer/components/tts/VoiceCloneSetup'

const TTSConfigPage: React.FC = () => {
  const handleSave = () => {
    console.log('Saving TTS config')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">语音合成配置</h1>
            <p className="text-sm text-slate-400">配置语音参数和声音克隆</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          保存配置
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Voice Settings */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <VoiceSettings />
            </div>
          </Card>
        </div>

        {/* Right: Voice Clone Setup */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <VoiceCloneSetup />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TTSConfigPage
