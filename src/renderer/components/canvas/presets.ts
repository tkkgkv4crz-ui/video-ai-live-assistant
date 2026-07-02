import type { SceneConfig } from '@/shared/types';

export const defaultScenes: SceneConfig[] = [
  {
    id: 'default',
    name: '默认场景',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
    },
    subtitle: {
      enabled: true,
      position: 'bottom',
      fontSize: 24,
      fontColor: '#ffffff',
      bgColor: '#000000',
      bgOpacity: 0.6,
    },
    overlays: [
      {
        id: 'welcome',
        type: 'text',
        position: { x: 50, y: 30 },
        size: { width: 300, height: 40 },
        content: '欢迎来到直播间！',
        style: { fontSize: '18px', color: '#fbbf24', fontWeight: 'bold' },
      },
    ],
  },
  {
    id: 'product',
    name: '带货场景',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
    },
    subtitle: {
      enabled: true,
      position: 'bottom',
      fontSize: 28,
      fontColor: '#ffffff',
      bgColor: '#000000',
      bgOpacity: 0.7,
    },
    overlays: [
      {
        id: 'discount',
        type: 'text',
        position: { x: 20, y: 20 },
        size: { width: 200, height: 50 },
        content: '限时优惠！',
        style: { fontSize: '24px', color: '#fbbf24', fontWeight: 'bold' },
      },
      {
        id: 'qr',
        type: 'qr',
        position: { x: 85, y: 75 },
        size: { width: 100, height: 100 },
        content: 'https://example.com',
        style: {},
      },
    ],
  },
  {
    id: 'gaming',
    name: '游戏场景',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e1b4b 100%)',
    },
    subtitle: {
      enabled: true,
      position: 'center',
      fontSize: 32,
      fontColor: '#00ff88',
      bgColor: '#000000',
      bgOpacity: 0.5,
    },
    overlays: [
      {
        id: 'tag',
        type: 'text',
        position: { x: 50, y: 15 },
        size: { width: 200, height: 40 },
        content: '🔴 LIVE',
        style: { fontSize: '20px', color: '#ef4444', fontWeight: 'bold' },
      },
    ],
  },
  {
    id: 'education',
    name: '教学场景',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
    },
    subtitle: {
      enabled: true,
      position: 'bottom',
      fontSize: 26,
      fontColor: '#e0f2fe',
      bgColor: '#0c4a6e',
      bgOpacity: 0.7,
    },
    overlays: [
      {
        id: 'title',
        type: 'text',
        position: { x: 50, y: 25 },
        size: { width: 400, height: 50 },
        content: 'AI知识课堂',
        style: { fontSize: '28px', color: '#7dd3fc', fontWeight: 'bold' },
      },
    ],
  },
];

export const getPresetById = (id: string): SceneConfig | undefined => {
  return defaultScenes.find((scene) => scene.id === id);
};

export const getDefaultScene = (): SceneConfig => {
  return JSON.parse(JSON.stringify(defaultScenes[0]));
};
