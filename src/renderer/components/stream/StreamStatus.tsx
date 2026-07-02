import React from 'react';
import { Radio } from 'lucide-react';
import type { StreamStatus as StreamStatusType } from '@/shared/types';
import { useStreamStore } from '@/renderer/store/useStreamStore';

// ------------------------------------------------------------------
// Status helpers
// ------------------------------------------------------------------
function getStatusConfig(status: StreamStatusType) {
  switch (status.state) {
    case 'connecting':
      return {
        label: '连接中',
        dotColor: 'bg-amber-500',
        pulse: true,
        textColor: 'text-amber-400',
      };
    case 'streaming':
      return {
        label: '直播中',
        dotColor: 'bg-green-500',
        pulse: true,
        textColor: 'text-green-400',
      };
    case 'error':
      return {
        label: '错误',
        dotColor: 'bg-red-500',
        pulse: false,
        textColor: 'text-red-400',
      };
    case 'stopping':
      return {
        label: '停止中',
        dotColor: 'bg-orange-500',
        pulse: true,
        textColor: 'text-orange-400',
      };
    default:
      return {
        label: '未开始',
        dotColor: 'bg-slate-500',
        pulse: false,
        textColor: 'text-slate-400',
      };
  }
}

// ------------------------------------------------------------------
// Props for standalone / embedded usage
// ------------------------------------------------------------------
interface StreamStatusProps {
  compact?: boolean;
  standalone?: boolean;
}

// ------------------------------------------------------------------
// StreamStatus component
// ------------------------------------------------------------------
const StreamStatus: React.FC<StreamStatusProps> = ({ compact = false, standalone = false }) => {
  const store = useStreamStore();
  const { status } = store;
  const config = getStatusConfig(status);

  if (compact) {
    // Compact mode for Header embedding
    return (
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${config.dotColor} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />
        <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
      </div>
    );
  }

  if (standalone) {
    // Standalone indicator card
    return (
      <div className="inline-flex items-center gap-3 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5">
        <div className="relative">
          <span
            className={`h-3 w-3 rounded-full ${config.dotColor} ${
              config.pulse ? 'animate-pulse' : ''
            }`}
          />
          {config.pulse && (
            <span
              className={`absolute inset-0 h-3 w-3 rounded-full ${config.dotColor} opacity-40 animate-ping`}
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Radio size={14} className={config.textColor} />
          <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
        </div>
      </div>
    );
  }

  // Default inline indicator
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-full ${config.dotColor} ${
          config.pulse ? 'animate-pulse' : ''
        }`}
      />
      <Radio size={14} className={config.textColor} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
};

export default StreamStatus;
