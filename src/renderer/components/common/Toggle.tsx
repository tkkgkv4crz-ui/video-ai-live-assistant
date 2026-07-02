import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  }

  const s = sizes[size]

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          s.track,
          checked ? 'bg-indigo-500' : 'bg-slate-600',
          !disabled && 'hover:opacity-90'
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span
          className={cn(
            'absolute left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200',
            s.thumb,
            checked && s.translate
          )}
        />
      </div>
      {label && (
        <span className="text-sm text-slate-300">{label}</span>
      )}
    </label>
  )
}

export default Toggle
