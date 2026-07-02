import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  LayoutDashboard,
  Bot,
  Volume2,
  Palette,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { NavItem } from '@/shared/types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '控制台', icon: 'LayoutDashboard', path: '/' },
  { id: 'ai', label: 'AI对话', icon: 'Bot', path: '/ai' },
  { id: 'tts', label: '语音合成', icon: 'Volume2', path: '/tts' },
  { id: 'scene', label: '场景编辑', icon: 'Palette', path: '/scene' },
  { id: 'stream', label: '推流配置', icon: 'Radio', path: '/stream' },
  { id: 'settings', label: '系统设置', icon: 'Settings', path: '/settings' },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Bot,
  Volume2,
  Palette,
  Radio,
  Settings,
}

export interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'h-full bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Logo area */}
      <div className="h-14 border-b border-slate-700 flex items-center justify-center px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-slate-100 whitespace-nowrap animate-slideInLeft">
              AI直播助手
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.icon]
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              {IconComponent && (
                <IconComponent
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
              )}
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap animate-slideInLeft">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-700 p-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
            'text-slate-500 hover:bg-slate-700 hover:text-slate-300',
            'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? '展开' : '收起'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs whitespace-nowrap">收起侧边栏</span>
            </>
          )}
        </button>

        {/* Version */}
        {!collapsed && (
          <div className="mt-2 px-3 text-xs text-slate-600 text-center">
            v1.0.0
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
