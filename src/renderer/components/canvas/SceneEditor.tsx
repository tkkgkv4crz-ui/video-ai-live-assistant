import { useState, useCallback } from 'react';
import {
  Layers,
  Type,
  Sparkles,
  Save,
  RotateCcw,
  ChevronDown,
  Plus,
  Trash2,
  Move,
  Image,
  Clock,
  QrCode,
  AlignLeft,
} from 'lucide-react';
import { LiveCanvas } from './LiveCanvas';
import { SubtitleOverlay } from './SubtitleOverlay';
import { BackgroundSelector } from './BackgroundSelector';
import { defaultScenes, getDefaultScene } from './presets';
import type { SceneConfig, OverlayElement } from '@/shared/types';

type EditorTab = 'background' | 'subtitle' | 'overlays';

export interface SceneEditorProps {
  initialScene?: SceneConfig;
  onSave?: (scene: SceneConfig) => void;
  previewSubtitle?: string;
}

export function SceneEditor({
  initialScene,
  onSave,
  previewSubtitle = '欢迎来到直播间！这是一条预览字幕，用于展示字幕显示效果。',
}: SceneEditorProps) {
  const [scene, setScene] = useState<SceneConfig>(() => {
    if (initialScene) return JSON.parse(JSON.stringify(initialScene));
    return getDefaultScene();
  });
  const [activeTab, setActiveTab] = useState<EditorTab>('background');
  const [selectedPreset, setSelectedPreset] = useState(scene.id);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Subtitle editing state
  const [subtitleText] = useState(previewSubtitle);

  const updateScene = useCallback((updates: Partial<SceneConfig>) => {
    setScene((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSubtitle = useCallback((updates: Partial<SceneConfig['subtitle']>) => {
    setScene((prev) => ({
      ...prev,
      subtitle: { ...prev.subtitle, ...updates },
    }));
  }, []);

  const handlePresetChange = (presetId: string) => {
    const preset = defaultScenes.find((s) => s.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setScene(JSON.parse(JSON.stringify(preset)));
    }
  };

  const handleSave = () => {
    onSave?.(scene);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleReset = () => {
    const fresh = getDefaultScene();
    setScene(fresh);
    setSelectedPreset('default');
  };

  const addOverlay = (type: OverlayElement['type']) => {
    const newOverlay: OverlayElement = {
      id: `overlay_${Date.now()}`,
      type,
      position: { x: 50, y: 40 },
      size: { width: 200, height: 50 },
      content: type === 'text' ? '新文本' : type === 'clock' ? '' : 'https://example.com',
      style:
        type === 'text'
          ? { fontSize: '18px', color: '#fbbf24', fontWeight: 'bold' }
          : type === 'qr'
          ? {}
          : {},
    };
    setScene((prev) => ({
      ...prev,
      overlays: [...prev.overlays, newOverlay],
    }));
  };

  const removeOverlay = (id: string) => {
    setScene((prev) => ({
      ...prev,
      overlays: prev.overlays.filter((o) => o.id !== id),
    }));
  };

  const updateOverlay = (id: string, updates: Partial<OverlayElement>) => {
    setScene((prev) => ({
      ...prev,
      overlays: prev.overlays.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
  };

  return (
    <div className="flex gap-5 h-full min-h-[600px]">
      {/* Left: Live Preview */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">实时预览</h3>
          <div className="flex items-center gap-2">
            {/* Preset Selector */}
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {defaultScenes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <LiveCanvas
          scene={scene}
          subtitle={subtitleText}
          isStreaming={true}
          viewerCount={1234}
          recentComments={[
            { id: '1', username: '小明', content: '主播讲得真好！', timestamp: Date.now() },
            { id: '2', username: '直播间观众', content: '学习了，感谢分享', timestamp: Date.now() - 5000 },
          ]}
        />

        {/* Subtitle only preview */}
        <div className="relative h-24 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50">
          <SubtitleOverlay
            text={subtitleText}
            config={scene.subtitle}
            isAnimating={false}
          />
        </div>
      </div>

      {/* Right: Editor Panel */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <TabButton2
            active={activeTab === 'background'}
            onClick={() => setActiveTab('background')}
            icon={<Layers className="w-4 h-4" />}
            label="背景"
          />
          <TabButton2
            active={activeTab === 'subtitle'}
            onClick={() => setActiveTab('subtitle')}
            icon={<Type className="w-4 h-4" />}
            label="字幕"
          />
          <TabButton2
            active={activeTab === 'overlays'}
            onClick={() => setActiveTab('overlays')}
            icon={<Sparkles className="w-4 h-4" />}
            label="装饰"
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'background' && (
            <BackgroundSelector
              value={scene.background}
              onChange={(bg) => updateScene({ background: bg })}
            />
          )}

          {activeTab === 'subtitle' && (
            <SubtitleEditor config={scene.subtitle} onChange={updateSubtitle} />
          )}

          {activeTab === 'overlays' && (
            <OverlaysEditor
              overlays={scene.overlays}
              onAdd={addOverlay}
              onRemove={removeOverlay}
              onUpdate={updateOverlay}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-3 border-t border-slate-700 bg-slate-800/80">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-green-600 rounded-lg text-white text-sm font-medium shadow-lg animate-fade-in-up">
          场景配置已保存
        </div>
      )}
    </div>
  );
}

// ========== Tab Button 2 ==========

interface TabButton2Props {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton2({ active, onClick, icon, label }: TabButton2Props) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'text-indigo-400 border-indigo-400 bg-indigo-400/5'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/30'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ========== Subtitle Editor ==========

interface SubtitleEditorProps {
  config: SceneConfig['subtitle'];
  onChange: (updates: Partial<SceneConfig['subtitle']>) => void;
}

function SubtitleEditor({ config, onChange }: SubtitleEditorProps) {
  const positions: { value: SceneConfig['subtitle']['position']; label: string }[] = [
    { value: 'top', label: '顶部' },
    { value: 'center', label: '居中' },
    { value: 'bottom', label: '底部' },
  ];

  return (
    <div className="space-y-5">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">启用字幕</label>
        <button
          onClick={() => onChange({ enabled: !config.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            config.enabled ? 'bg-indigo-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Position */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">位置</label>
            <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
              {positions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onChange({ position: p.value })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    config.position === p.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">字体大小</label>
              <span className="text-xs text-slate-500">{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={64}
              value={config.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>12px</span>
              <span>64px</span>
            </div>
          </div>

          {/* Font Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">字体颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.fontColor}
                onChange={(e) => onChange({ fontColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={config.fontColor}
                onChange={(e) => onChange({ fontColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">背景颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Background Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">背景透明度</label>
              <span className="text-xs text-slate-500">{Math.round(config.bgOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(config.bgOpacity * 100)}
              onChange={(e) => onChange({ bgOpacity: Number(e.target.value) / 100 })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ========== Overlays Editor ==========

interface OverlaysEditorProps {
  overlays: OverlayElement[];
  onAdd: (type: OverlayElement['type']) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OverlayElement>) => void;
}

function OverlaysEditor({ overlays, onAdd, onRemove, onUpdate }: OverlaysEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const overlayTypes: { type: OverlayElement['type']; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: '文字', icon: <AlignLeft className="w-4 h-4" /> },
    { type: 'image', label: '图片', icon: <Image className="w-4 h-4" /> },
    { type: 'clock', label: '时钟', icon: <Clock className="w-4 h-4" /> },
    { type: 'qr', label: '二维码', icon: <QrCode className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Add Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {overlayTypes.map((t) => (
          <button
            key={t.type}
            onClick={() => onAdd(t.type)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            {t.icon}
            <Plus className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overlay List */}
      <div className="space-y-2">
        {overlays.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            暂无装饰元素，点击上方按钮添加
          </div>
        )}
        {overlays.map((overlay) => (
          <OverlayCard
            key={overlay.id}
            overlay={overlay}
            expanded={expandedId === overlay.id}
            onToggle={() => setExpandedId(expandedId === overlay.id ? null : overlay.id)}
            onRemove={() => onRemove(overlay.id)}
            onUpdate={(updates) => onUpdate(overlay.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

// ========== Overlay Card ==========

interface OverlayCardProps {
  overlay: OverlayElement;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<OverlayElement>) => void;
}

function OverlayCard({ overlay, expanded, onToggle, onRemove, onUpdate }: OverlayCardProps) {
  const typeLabels: Record<OverlayElement['type'], string> = {
    text: '文字',
    image: '图片',
    clock: '时钟',
    qr: '二维码',
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={onToggle}
      >
        <Move className="w-3 h-3 text-slate-500" />
        <span className="text-xs text-slate-500 uppercase w-12">{typeLabels[overlay.type]}</span>
        <span className="flex-1 text-sm text-slate-200 truncate">{overlay.content || typeLabels[overlay.type]}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded Editor */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-700/50 pt-2 space-y-3">
          {/* Content */}
          {overlay.type !== 'clock' && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400">内容</label>
              <input
                type="text"
                value={overlay.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">X (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={overlay.position.x}
                onChange={(e) =>
                  onUpdate({
                    position: { ...overlay.position, x: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Y (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={overlay.position.y}
                onChange={(e) =>
                  onUpdate({
                    position: { ...overlay.position, y: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">宽度 (px)</label>
              <input
                type="number"
                min={10}
                max={1920}
                value={overlay.size.width}
                onChange={(e) =>
                  onUpdate({
                    size: { ...overlay.size, width: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">高度 (px)</label>
              <input
                type="number"
                min={10}
                max={1080}
                value={overlay.size.height}
                onChange={(e) =>
                  onUpdate({
                    size: { ...overlay.size, height: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Style for text */}
          {overlay.type === 'text' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">字体大小</label>
                <input
                  type="text"
                  value={(overlay.style as React.CSSProperties)?.fontSize || '18px'}
                  onChange={(e) =>
                    onUpdate({
                      style: { ...overlay.style, fontSize: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">文字颜色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={((overlay.style as React.CSSProperties)?.color as string) || '#fbbf24'}
                    onChange={(e) =>
                      onUpdate({
                        style: { ...overlay.style, color: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-slate-600 bg-slate-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={((overlay.style as React.CSSProperties)?.color as string) || '#fbbf24'}
                    onChange={(e) =>
                      onUpdate({
                        style: { ...overlay.style, color: e.target.value },
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export
export { defaultScenes, getDefaultScene };
export type { SceneConfig };
