import type { LayoutConfig, LayoutType } from '../types/layout';

export const LAYOUT_PRESETS: Record<LayoutType, LayoutConfig> = {
  'classic-strip': {
    type: 'classic-strip',
    label: 'Classic Strip',
    photoCount: 3,
    stripAspectRatio: 0.33,
    positions: [
      { x: 0.05, y: 0.02, width: 0.9, height: 0.3 },
      { x: 0.05, y: 0.35, width: 0.9, height: 0.3 },
      { x: 0.05, y: 0.68, width: 0.9, height: 0.3 },
    ],
  },
  'tall-strip': {
    type: 'tall-strip',
    label: 'Tall Strip',
    photoCount: 4,
    stripAspectRatio: 0.25,
    positions: [
      { x: 0.05, y: 0.01, width: 0.9, height: 0.23 },
      { x: 0.05, y: 0.26, width: 0.9, height: 0.23 },
      { x: 0.05, y: 0.51, width: 0.9, height: 0.23 },
      { x: 0.05, y: 0.76, width: 0.9, height: 0.23 },
    ],
  },
  polaroid: {
    type: 'polaroid',
    label: 'Polaroid',
    photoCount: 1,
    stripAspectRatio: 0.83,
    positions: [
      { x: 0.08, y: 0.05, width: 0.84, height: 0.72 },
    ],
  },
  '2x2-grid': {
    type: '2x2-grid',
    label: '2×2 Grid',
    photoCount: 4,
    stripAspectRatio: 1.0,
    positions: [
      { x: 0.03, y: 0.03, width: 0.45, height: 0.45 },
      { x: 0.52, y: 0.03, width: 0.45, height: 0.45 },
      { x: 0.03, y: 0.52, width: 0.45, height: 0.45 },
      { x: 0.52, y: 0.52, width: 0.45, height: 0.45 },
    ],
  },
  '4x6-layout': {
    type: '4x6-layout',
    label: '4×6 Layout',
    photoCount: 6,
    stripAspectRatio: 0.67,
    positions: [
      { x: 0.03, y: 0.02, width: 0.45, height: 0.3 },
      { x: 0.52, y: 0.02, width: 0.45, height: 0.3 },
      { x: 0.03, y: 0.35, width: 0.45, height: 0.3 },
      { x: 0.52, y: 0.35, width: 0.45, height: 0.3 },
      { x: 0.03, y: 0.68, width: 0.45, height: 0.3 },
      { x: 0.52, y: 0.68, width: 0.45, height: 0.3 },
    ],
  },
};

export const LAYOUT_LIST: LayoutConfig[] = Object.values(LAYOUT_PRESETS);
