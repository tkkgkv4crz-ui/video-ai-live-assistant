import React, { useRef, useEffect, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Terminal,
} from 'lucide-react'
import { useLogStore } from '@/renderer/store/useLogStore'
import type { LogEntry } from '@/shared/types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const levelStyles: Record<LogEntry['level'], string> = {
  debug: 'text-slate-500',
  info: 'text-slate-300',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-green-400',
}

const levelLabels: Record<LogEntry['level'], string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  success: 'SUCCESS',
}

export interface LogPanelProps {
  className?: string
}

const LogPanel: React.FC<LogPanelProps> = ({ className }) => {
  const { entries, clearLogs } = useLogStore()
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, collapsed])

  const formatTime = (timestamp: number): string => {
    const d = new Date(timestamp)
    return d.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div
      className={cn(
        'border-t border-slate-700 bg-slate-800 flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'h-9' : 'h-44',
        className
      )}
    >
      {/* Header bar */}
      <div
        className="h-9 flex items-center justify-between px-4 cursor-pointer select-none shrink-0"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            系统日志
          </span>
          <span className="text-xs text-slate-600">({entries.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {!collapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearLogs()
              }}
              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
              title="清空日志"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </div>

      {/* Log entries */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-1 font-mono text-xs space-y-0.5"
        >
          {entries.length === 0 && (
            <div className="text-slate-600 italic py-2">暂无日志...</div>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2 py-0.5 animate-fadeIn"
            >
              <span className="text-slate-600 shrink-0 tabular-nums">
                {formatTime(entry.timestamp)}
              </span>
              <span
                className={cn(
                  'shrink-0 font-bold w-14 text-right',
                  levelStyles[entry.level]
                )}
              >
                {levelLabels[entry.level]}
              </span>
              <span className={cn('break-all', levelStyles[entry.level])}>
                {entry.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LogPanel
