import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  showValue?: boolean
  valueFormatter?: (value: number) => string
  disabled?: boolean
  className?: string
}

const Slider: React.FC<SliderProps> = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  showValue = true,
  valueFormatter = (v) => String(v),
  disabled = false,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-sm font-medium text-slate-300">{label}</span>
        )}
        {showValue && (
          <span className="text-sm text-slate-400 tabular-nums">
            {valueFormatter(value)}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <div className="relative w-full h-5 flex items-center">
          {/* Track background */}
          <div className="absolute w-full h-1.5 bg-slate-700 rounded-full" />
          {/* Filled track */}
          <div
            className="absolute h-1.5 bg-indigo-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
          {/* Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'absolute w-full h-5 opacity-0 cursor-pointer z-10',
              disabled && 'cursor-not-allowed'
            )}
          />
          {/* Thumb */}
          <div
            className={cn(
              'absolute w-4 h-4 bg-indigo-500 rounded-full shadow-md border-2 border-indigo-400 pointer-events-none z-0',
              'transition-transform duration-75',
              !disabled && 'hover:scale-110'
            )}
            style={{
              left: `calc(${percentage}% - 8px)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Slider
