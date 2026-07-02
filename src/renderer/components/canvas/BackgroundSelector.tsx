import { useState, useCallback } from 'react';
import { Type, Image, Palette, ChevronDown } from 'lucide-react';
import type { SceneConfig } from '@/shared/types';

type BackgroundValue = SceneConfig['background'];

export interface BackgroundSelectorProps {
  value: BackgroundValue;
  onChange: (bg: BackgroundValue) => void;
}

const presetGradients = [
  { label: '深蓝紫', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)' },
  { label: '深海蓝', value: 'linear-gradient(135deg, #0c4a6e 0%, #0f172a 50%, #1e1b4b 100%)' },
  { label: '紫罗兰', value: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)' },
  { label: '森林绿', value: 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e1b4b 100%)' },
  { label: '暗红金', value: 'linear-gradient(135deg, #450a0a 0%, #0f172a 50%, #713f12 100%)' },
  { label: '极夜黑', value: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' },
];

const presetColors = [
  '#0f172a', '#1e293b', '#334155', '#1e1b4b',
  '#312e81', '#4c1d95', '#581c87', '#0c4a6e',
  '#164e63', '#064e3b', '#3f6212', '#713f12',
  '#7f1d1d', '#450a0a', '#020617', '#171717',
];

const gradientDirections = [
  { label: '左上 → 右下', value: '135deg' },
  { label: '左 → 右', value: '90deg' },
  { label: '上 → 下', value: '180deg' },
  { label: '右上 → 左下', value: '225deg' },
  { label: '径向', value: 'circle' },
];

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  const [activeTab, setActiveTab] = useState<BackgroundValue['type']>(value.type);

  const handleTypeChange = useCallback((type: BackgroundValue['type']) => {
    setActiveTab(type);
    if (type === 'color') {
      onChange({ type: 'color', value: '#0f172a' });
    } else if (type === 'gradient') {
      onChange({ type: 'gradient', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)' });
    } else if (type === 'image') {
      onChange({ type: 'image', value: '' });
    }
  }, [onChange]);

  return (
    <div className="space-y-5">
      {/* Type Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
        <TabButton
          active={activeTab === 'color'}
          onClick={() => handleTypeChange('color')}
          icon={<Palette className="w-4 h-4" />}
          label="纯色"
        />
        <TabButton
          active={activeTab === 'gradient'}
          onClick={() => handleTypeChange('gradient')}
          icon={<Type className="w-4 h-4" />}
          label="渐变"
        />
        <TabButton
          active={activeTab === 'image'}
          onClick={() => handleTypeChange('image')}
          icon={<Image className="w-4 h-4" />}
          label="图片"
        />
      </div>

      {/* Color Type */}
      {activeTab === 'color' && (
        <ColorPanel value={value.value} onChange={(v) => onChange({ type: 'color', value: v })} />
      )}

      {/* Gradient Type */}
      {activeTab === 'gradient' && (
        <GradientPanel value={value.value} onChange={(v) => onChange({ type: 'gradient', value: v })} />
      )}

      {/* Image Type */}
      {activeTab === 'image' && (
        <ImagePanel value={value.value} onChange={(v) => onChange({ type: 'image', value: v })} />
      )}

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">实时预览</label>
        <div
          className="w-full h-24 rounded-lg border border-slate-700 overflow-hidden"
          style={
            value.type === 'image' && value.value
              ? { backgroundImage: `url(${value.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : value.type === 'color'
              ? { background: value.value }
              : { background: value.value }
          }
        />
      </div>
    </div>
  );
}

// ========== Tab Button ==========

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ========== Color Panel ==========

interface ColorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

function ColorPanel({ value, onChange }: ColorPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">预设颜色</label>
        <div className="grid grid-cols-8 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                value === color ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-slate-600'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">自定义颜色</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#0f172a'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="#0f172a"
          />
        </div>
      </div>
    </div>
  );
}

// ========== Gradient Panel ==========

interface GradientPanelProps {
  value: string;
  onChange: (value: string) => void;
}

function GradientPanel({ value, onChange }: GradientPanelProps) {
  const parsed = parseGradient(value);
  const [color1, setColor1] = useState(parsed.color1);
  const [color2, setColor2] = useState(parsed.color2);
  const [direction, setDirection] = useState(parsed.direction);

  const updateGradient = useCallback((d: string, c1: string, c2: string) => {
    if (d === 'circle') {
      onChange(`radial-gradient(circle, ${c1} 0%, ${c2} 100%)`);
    } else {
      onChange(`linear-gradient(${d}, ${c1} 0%, ${c2} 100%)`);
    }
  }, [onChange]);

  const handleDirectionChange = (d: string) => {
    setDirection(d);
    updateGradient(d, color1, color2);
  };

  const handleColor1Change = (c: string) => {
    setColor1(c);
    updateGradient(direction, c, color2);
  };

  const handleColor2Change = (c: string) => {
    setColor2(c);
    updateGradient(direction, color1, c);
  };

  return (
    <div className="space-y-4">
      {/* Direction */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">渐变方向</label>
        <div className="relative">
          <select
            value={direction}
            onChange={(e) => handleDirectionChange(e.target.value)}
            className="w-full appearance-none px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
          >
            {gradientDirections.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">起始颜色</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color1}
            onChange={(e) => handleColor1Change(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer"
          />
          <input
            type="text"
            value={color1}
            onChange={(e) => handleColor1Change(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">结束颜色</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color2}
            onChange={(e) => handleColor2Change(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer"
          />
          <input
            type="text"
            value={color2}
            onChange={(e) => handleColor2Change(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">预设渐变</label>
        <div className="grid grid-cols-3 gap-2">
          {presetGradients.map((g) => (
            <button
              key={g.value}
              onClick={() => {
                onChange(g.value);
                const p = parseGradient(g.value);
                setColor1(p.color1);
                setColor2(p.color2);
                setDirection(p.direction);
              }}
              className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                value === g.value ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-slate-600'
              }`}
              style={{ background: g.value }}
              title={g.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function parseGradient(value: string): { color1: string; color2: string; direction: string } {
  try {
    if (value.includes('radial-gradient')) {
      const match = value.match(/radial-gradient\(circle,\s*(#[0-9a-fA-F]{6})\s*0%,\s*(#[0-9a-fA-F]{6})/);
      if (match) return { color1: match[1], color2: match[2], direction: 'circle' };
    }
    const match = value.match(/linear-gradient\(([\w]+),\s*(#[0-9a-fA-F]{6})\s*0%,\s*(#[0-9a-fA-F]{6})/);
    if (match) return { color1: match[2], color2: match[3], direction: match[1] };
  } catch { /* empty */ }
  return { color1: '#1e293b', color2: '#1e1b4b', direction: '135deg' };
}

// ========== Image Panel ==========

interface ImagePanelProps {
  value: string;
  onChange: (value: string) => void;
}

const presetImages = [
  { label: '科技网格', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
  { label: '深色抽象', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { label: '霓虹城市', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=80' },
  { label: '星空', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80' },
];

function ImagePanel({ value, onChange }: ImagePanelProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">上传图片</label>
        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all">
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Image className="w-6 h-6" />
            <span className="text-xs">点击选择图片</span>
          </div>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">图片链接</label>
        <input
          type="text"
          value={value.startsWith('http') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">预设图片</label>
        <div className="grid grid-cols-2 gap-2">
          {presetImages.map((img) => (
            <button
              key={img.url}
              onClick={() => onChange(img.url)}
              className={`relative h-20 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                value === img.url ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-slate-600'
              }`}
            >
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs py-1">
                {img.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
