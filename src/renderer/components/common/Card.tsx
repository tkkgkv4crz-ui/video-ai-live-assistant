import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  header,
  footer,
  hover = false,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-lg overflow-hidden',
        hover && 'transition-all duration-150 hover:border-slate-600 hover:shadow-lg cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-slate-700">{footer}</div>
      )}
    </div>
  )
}

export default Card
