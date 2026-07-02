import React, { useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import LogPanel from './LogPanel'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const pageTitles: Record<string, string> = {
  '/': '主控制台',
  '/ai': 'AI 对话配置',
  '/tts': '语音合成配置',
  '/scene': '直播场景编辑',
  '/stream': '推流配置',
  '/settings': '系统设置',
}

export interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'AI直播助手'

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header title={title} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </main>

        {/* Log Panel */}
        <LogPanel />
      </div>
    </div>
  )
}

export default AppLayout
