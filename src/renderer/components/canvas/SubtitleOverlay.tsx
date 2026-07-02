import { useState, useEffect, useMemo } from 'react';
import type { SceneConfig } from '@/shared/types';

export interface SubtitleOverlayProps {
  text: string;
  config: SceneConfig['subtitle'];
  isAnimating?: boolean;
}

export function SubtitleOverlay({ text, config, isAnimating = true }: SubtitleOverlayProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!isAnimating) {
      setDisplayText(text);
      return;
    }
    let index = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [text, isAnimating]);

  const positionClasses = useMemo(() => {
    switch (config.position) {
      case 'top':
        return 'top-8 left-1/2 -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-24 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-24 left-1/2 -translate-x-1/2';
    }
  }, [config.position]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(config.bgColor, config.bgOpacity),
    maxWidth: '85%',
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${config.fontSize}px`,
    color: config.fontColor,
    textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.8)',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  };

  if (!config.enabled) return null;

  return (
    <div
      className={`absolute z-20 px-6 py-3 rounded-lg ${positionClasses}`}
      style={containerStyle}
    >
      <p style={textStyle}>{displayText}</p>
    </div>
  );
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
