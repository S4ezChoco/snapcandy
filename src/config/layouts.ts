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
  'filmstrip-horizontal': {
    type: 'filmstrip-horizontal',
    label: 'Filmstrip Horizontal',
    photoCount: 3,
    stripAspectRatio: 3.0,
    positions: [
      { x: 0.02, y: 0.05, width: 0.3, height: 0.9 },
      { x: 0.35, y: 0.05, width: 0.3, height: 0.9 },
      { x: 0.68, y: 0.05, width: 0.3, height: 0.9 },
    ],
  },
  'asymmetric-1-plus-3': {
    type: 'asymmetric-1-plus-3',
    label: 'Asymmetric 1+3',
    photoCount: 4,
    stripAspectRatio: 1.2,
    positions: [
      { x: 0.02, y: 0.02, width: 0.56, height: 0.96 },
      { x: 0.6, y: 0.02, width: 0.38, height: 0.3 },
      { x: 0.6, y: 0.35, width: 0.38, height: 0.3 },
      { x: 0.6, y: 0.68, width: 0.38, height: 0.3 },
    ],
  },
  'collage-mosaic': {
    type: 'collage-mosaic',
    label: 'Collage Mosaic',
    photoCount: 5,
    stripAspectRatio: 1.0,
    positions: [
      { x: 0.02, y: 0.02, width: 0.48, height: 0.48 },
      { x: 0.52, y: 0.02, width: 0.46, height: 0.28 },
      { x: 0.52, y: 0.32, width: 0.46, height: 0.18 },
      { x: 0.02, y: 0.52, width: 0.3, height: 0.46 },
      { x: 0.34, y: 0.52, width: 0.64, height: 0.46 },
    ],
  },
  'panoramic-strip': {
    type: 'panoramic-strip',
    label: 'Panoramic Strip',
    photoCount: 2,
    stripAspectRatio: 2.5,
    positions: [
      { x: 0.02, y: 0.05, width: 0.47, height: 0.9 },
      { x: 0.51, y: 0.05, width: 0.47, height: 0.9 },
    ],
  },
  'polaroid-stack': {
    type: 'polaroid-stack',
    label: 'Polaroid Stack',
    photoCount: 3,
    stripAspectRatio: 0.75,
    positions: [
      { x: 0.05, y: 0.02, width: 0.7, height: 0.4 },
      { x: 0.15, y: 0.3, width: 0.7, height: 0.4 },
      { x: 0.1, y: 0.58, width: 0.7, height: 0.4 },
    ],
  },
  'triple-tall': {
    type: 'triple-tall',
    label: 'Triple Tall',
    photoCount: 3,
    stripAspectRatio: 0.3,
    positions: [
      { x: 0.05, y: 0.01, width: 0.9, height: 0.31 },
      { x: 0.05, y: 0.34, width: 0.9, height: 0.31 },
      { x: 0.05, y: 0.67, width: 0.9, height: 0.31 },
    ],
  },
  'big-small-big': {
    type: 'big-small-big',
    label: 'Big-Small-Big',
    photoCount: 3,
    stripAspectRatio: 0.4,
    positions: [
      { x: 0.05, y: 0.02, width: 0.9, height: 0.38 },
      { x: 0.15, y: 0.42, width: 0.7, height: 0.2 },
      { x: 0.05, y: 0.64, width: 0.9, height: 0.34 },
    ],
  },
};

export const LAYOUT_LIST: LayoutConfig[] = Object.values(LAYOUT_PRESETS);
