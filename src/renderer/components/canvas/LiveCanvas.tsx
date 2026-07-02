import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { SubtitleOverlay } from './SubtitleOverlay';
import type { SceneConfig, Comment } from '@/shared/types';

export interface LiveCanvasProps {
  scene: SceneConfig;
  subtitle: string;
  isStreaming: boolean;
  viewerCount?: number;
  recentComments?: Comment[];
}

export function LiveCanvas({
  scene,
  subtitle,
  isStreaming,
  viewerCount = 0,
  recentComments = [],
}: LiveCanvasProps) {
  const backgroundStyle = useMemo(() => {
    const { type, value } = scene.background;
    if (type === 'color' || type === 'gradient') {
      return { background: value };
    }
    if (type === 'image') {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  }, [scene.background]);

  const visibleComments = useMemo(() => {
    return recentComments.slice(-3).reverse();
  }, [recentComments]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900" style={{ aspectRatio: '16/9' }}>
      {/* Background Layer */}
      <div className="absolute inset-0" style={backgroundStyle} />

      {/* Overlay Elements Layer */}
      <div className="absolute inset-0 z-10">
        {scene.overlays.map((overlay) => (
          <OverlayItem key={overlay.id} overlay={overlay} />
        ))}
      </div>

      {/* LIVE Badge */}
      {isStreaming && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white font-bold text-sm animate-pulse">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          LIVE
        </div>
      )}

      {/* Viewer Count */}
      {isStreaming && viewerCount > 0 && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-slate-200 text-sm font-medium">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{formatViewerCount(viewerCount)}</span>
        </div>
      )}

      {/* Subtitle Layer */}
      <SubtitleOverlay
        text={subtitle}
        config={scene.subtitle}
        isAnimating={isStreaming}
      />

      {/* Comments Layer (Bottom) */}
      {visibleComments.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col gap-1.5">
          {visibleComments.map((comment) => (
            <CommentBubble key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Overlay Item ==========

import type { OverlayElement } from '@/shared/types';

interface OverlayItemProps {
  overlay: OverlayElement;
}

function OverlayItem({ overlay }: OverlayItemProps) {
  const { type, position, size, content, style } = overlay;

  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    ...style,
  };

  if (type === 'text') {
    return (
      <div style={positionStyle} className="flex items-center justify-center pointer-events-none">
        <span className="drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          {content}
        </span>
      </div>
    );
  }

  if (type === 'clock') {
    return (
      <div style={positionStyle} className="flex items-center justify-center pointer-events-none">
        <LiveClock style={style} />
      </div>
    );
  }

  if (type === 'qr') {
    return (
      <div style={positionStyle} className="flex items-center justify-center">
        <QRPlaceholder content={content} size={Math.min(size.width, size.height)} />
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div style={positionStyle} className="overflow-hidden rounded">
        <img
          src={content}
          alt="overlay"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return null;
}

// ========== Live Clock ==========

import { useState, useEffect } from 'react';

function LiveClock({ style }: { style: React.CSSProperties }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <span
      className="font-mono font-bold tracking-wider drop-shadow-lg"
      style={{
        ...style,
        textShadow: '0 2px 8px rgba(0,0,0,0.6)',
      }}
    >
      {timeStr}
    </span>
  );
}

// ========== QR Placeholder ==========

function QRPlaceholder({ content, size }: { content: string; size: number }) {
  const qrData = useMemo(() => {
    // Simple visual placeholder for QR code
    const cells: boolean[] = [];
    const seed = content.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    for (let i = 0; i < 64; i++) {
      cells.push((seed * (i + 1) * 7) % 3 !== 0);
    }
    return cells;
  }, [content]);

  return (
    <div
      className="bg-white rounded p-1"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 8 8" className="w-full h-full">
        {qrData.map((filled, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          return filled ? (
            <rect key={i} x={x} y={y} width="1" height="1" fill="#1e293b" />
          ) : null;
        })}
        {/* Corner markers */}
        <rect x="0" y="0" width="3" height="3" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x="5" y="0" width="3" height="3" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x="0" y="5" width="3" height="3" fill="none" stroke="#1e293b" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ========== Comment Bubble ==========

interface CommentBubbleProps {
  comment: Comment;
}

function CommentBubble({ comment }: CommentBubbleProps) {
  const initial = comment.username.charAt(0).toUpperCase();
  const colorClass = getAvatarColor(comment.username);

  return (
    <div className="flex items-start gap-2 animate-fade-in-up">
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex flex-col bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 max-w-full">
          <span className="text-xs text-indigo-400 font-medium truncate">{comment.username}</span>
          <span className="text-sm text-slate-200 break-words">{comment.content}</span>
        </div>
      </div>
    </div>
  );
}

// ========== Helpers ==========

function formatViewerCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function getAvatarColor(username: string): string {
  const colors = [
    'bg-red-500 text-white',
    'bg-orange-500 text-white',
    'bg-amber-500 text-white',
    'bg-green-500 text-white',
    'bg-emerald-500 text-white',
    'bg-teal-500 text-white',
    'bg-cyan-500 text-white',
    'bg-sky-500 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-purple-500 text-white',
    'bg-fuchsia-500 text-white',
    'bg-pink-500 text-white',
    'bg-rose-500 text-white',
  ];
  const index = username.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
