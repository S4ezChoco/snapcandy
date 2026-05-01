export type LayoutType =
  | 'classic-strip'
  | 'tall-strip'
  | 'polaroid'
  | '2x2-grid'
  | '4x6-layout'
  | 'filmstrip-horizontal'
  | 'asymmetric-1-plus-3'
  | 'collage-mosaic'
  | 'panoramic-strip'
  | 'polaroid-stack'
  | 'triple-tall'
  | 'big-small-big';

export interface PhotoPosition {
  x: number;      // normalized x (0-1)
  y: number;      // normalized y (0-1)
  width: number;  // normalized width (0-1)
  height: number; // normalized height (0-1)
}

export interface LayoutConfig {
  type: LayoutType;
  label: string;
  photoCount: number;
  positions: PhotoPosition[];
  stripAspectRatio: number; // width / height
}
