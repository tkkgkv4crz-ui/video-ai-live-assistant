import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/renderer/components/layout/AppLayout'
import Dashboard from '@/renderer/pages/Dashboard'
import AIConfigPage from '@/renderer/pages/AIConfigPage'
import TTSConfigPage from '@/renderer/pages/TTSConfigPage'
import SceneEditorPage from '@/renderer/pages/SceneEditorPage'
import StreamConfigPage from '@/renderer/pages/StreamConfigPage'
import SettingsPage from '@/renderer/pages/SettingsPage'

const App: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AIConfigPage />} />
        <Route path="/tts" element={<TTSConfigPage />} />
        <Route path="/scene" element={<SceneEditorPage />} />
        <Route path="/stream" element={<StreamConfigPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
