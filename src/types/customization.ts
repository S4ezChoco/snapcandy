export type FilterType = 'grayscale' | 'sepia' | 'vintage' | 'warm' | 'cool' | 'none';

export interface StickerPlacement {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  rotation: number;
}

export interface ImageAdjustments {
  brightness: number;    // -100 to 100, default 0
  contrast: number;      // -100 to 100, default 0
  saturation: number;    // -100 to 100, default 0
  exposure: number;      // -100 to 100, default 0
  temperature: number;   // -100 to 100, default 0
  tint: number;          // -100 to 100, default 0
  highlights: number;    // -100 to 100, default 0
  shadows: number;       // -100 to 100, default 0
  sharpness: number;     // 0 to 100, default 0
  vignette: number;      // 0 to 100, default 0
  grain: number;         // 0 to 100, default 0
  blur: number;          // 0 to 100, default 0
  fade: number;          // 0 to 100, default 0
}

export interface DateStampConfig {
  format: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface ShapeConfig {
  borderRadius: number; // 0 to 50 (percentage)
  borderWidth: number;
  borderColor: string;
}

export interface LogoPlacement {
  imageDataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Customization {
  stickers: StickerPlacement[];
  textOverlays: TextOverlay[];
  filter: FilterType | null;
  adjustments: ImageAdjustments;
  dateStamp: DateStampConfig | null;
  shape: ShapeConfig;
  logo: LogoPlacement | null;
}
