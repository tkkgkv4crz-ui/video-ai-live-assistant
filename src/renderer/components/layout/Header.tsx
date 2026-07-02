import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Radio, RadioOff } from 'lucide-react'
import { useStreamStore } from '@/renderer/store/useStreamStore'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface HeaderProps {
  title: string
  className?: string
}

const Header: React.FC<HeaderProps> = ({ title, className }) => {
  const { status } = useStreamStore()

  const stateConfig = {
    idle: { label: '未连接', color: 'bg-slate-500', textColor: 'text-slate-400' },
    connecting: { label: '连接中', color: 'bg-amber-500', textColor: 'text-amber-400' },
    streaming: { label: '推流中', color: 'bg-green-500', textColor: 'text-green-400' },
    error: { label: '推流错误', color: 'bg-red-500', textColor: 'text-red-400' },
    stopping: { label: '停止中', color: 'bg-amber-500', textColor: 'text-amber-400' },
  }

  const config = stateConfig[status.state]

  return (
    <header
      className={cn(
        'h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0',
        className
      )}
    >
      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-700">
          {status.state === 'streaming' ? (
            <Radio className="w-4 h-4 text-green-400 animate-pulse" />
          ) : (
            <RadioOff className="w-4 h-4 text-slate-500" />
          )}
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              config.color,
              status.state === 'streaming' && 'animate-pulse'
            )}
          />
          <span className={cn('text-sm font-medium', config.textColor)}>
            {config.label}
          </span>
          {status.state === 'streaming' && status.duration > 0 && (
            <span className="text-xs text-slate-500 ml-1 tabular-nums">
              {formatDuration(status.duration)}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default Header
