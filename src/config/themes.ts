import type { ThemeConfig } from '../types/theme';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'midnight-glimmer',
    label: 'Midnight Glimmer',
    tag: 'Signature',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1f3c 100%)',
    accentColor: '#f4a261',
    decorations: [
      { type: 'star', position: { x: 0.05, y: 0.08 }, size: 14, opacity: 0.9 },
      { type: 'star', position: { x: 0.88, y: 0.12 }, size: 10, opacity: 0.7 },
      { type: 'star', position: { x: 0.15, y: 0.45 }, size: 8, opacity: 0.5 },
      { type: 'star', position: { x: 0.92, y: 0.52 }, size: 12, opacity: 0.8 },
      { type: 'star', position: { x: 0.08, y: 0.85 }, size: 10, opacity: 0.6 },
      { type: 'star', position: { x: 0.78, y: 0.92 }, size: 9, opacity: 0.7 },
      { type: 'sparkle', position: { x: 0.35, y: 0.05 }, size: 6, opacity: 0.6 },
      { type: 'sparkle', position: { x: 0.65, y: 0.15 }, size: 5, opacity: 0.5 },
      { type: 'sparkle', position: { x: 0.2, y: 0.6 }, size: 7, opacity: 0.4 },
      { type: 'sparkle', position: { x: 0.75, y: 0.7 }, size: 6, opacity: 0.55 },
      { type: 'sparkle', position: { x: 0.5, y: 0.95 }, size: 5, opacity: 0.45 },
      { type: 'sparkle', position: { x: 0.42, y: 0.38 }, size: 4, opacity: 0.35 },
    ],
  },
  {
    id: 'sakura-y2k',
    label: 'Sakura Y2K',
    tag: 'Fan Fave',
    background: 'linear-gradient(135deg, #2d1b3d 0%, #4a2040 50%, #1f1030 100%)',
    accentColor: '#ff8fab',
    decorations: [
      { type: 'petal', position: { x: 0.04, y: 0.06 }, size: 16, opacity: 0.8 },
      { type: 'petal', position: { x: 0.9, y: 0.1 }, size: 12, opacity: 0.65 },
      { type: 'petal', position: { x: 0.12, y: 0.35 }, size: 14, opacity: 0.7 },
      { type: 'petal', position: { x: 0.85, y: 0.42 }, size: 10, opacity: 0.55 },
      { type: 'petal', position: { x: 0.06, y: 0.72 }, size: 13, opacity: 0.75 },
      { type: 'petal', position: { x: 0.92, y: 0.8 }, size: 11, opacity: 0.6 },
      { type: 'petal', position: { x: 0.5, y: 0.03 }, size: 9, opacity: 0.5 },
      { type: 'petal', position: { x: 0.48, y: 0.95 }, size: 10, opacity: 0.45 },
      { type: 'sparkle', position: { x: 0.3, y: 0.15 }, size: 5, opacity: 0.6 },
      { type: 'sparkle', position: { x: 0.7, y: 0.25 }, size: 6, opacity: 0.5 },
      { type: 'sparkle', position: { x: 0.18, y: 0.55 }, size: 4, opacity: 0.45 },
      { type: 'sparkle', position: { x: 0.82, y: 0.65 }, size: 5, opacity: 0.55 },
      { type: 'sparkle', position: { x: 0.4, y: 0.88 }, size: 6, opacity: 0.4 },
      { type: 'sparkle', position: { x: 0.6, y: 0.5 }, size: 4, opacity: 0.35 },
    ],
  },
  {
    id: 'custom-studio',
    label: 'Custom Studio',
    tag: 'Creative',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accentColor: '#e07a5f',
    decorations: [],
    customColors: { background: '#1a1a2e', accent: '#e07a5f' },
  },
];

export const getThemeById = (id: ThemeConfig['id']): ThemeConfig | undefined =>
  THEME_PRESETS.find((theme) => theme.id === id);
