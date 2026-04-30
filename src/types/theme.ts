export type ThemeId = 'midnight-glimmer' | 'sakura-y2k' | 'custom-studio';

export interface DecorationElement {
  type: 'star' | 'petal' | 'sparkle' | 'border-pattern';
  position: { x: number; y: number };
  size: number;
  opacity: number;
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  tag: string; // e.g., "Signature", "Fan Fave", "Creative"
  background: string; // CSS gradient or color
  accentColor: string;
  decorations: DecorationElement[];
  customColors?: { background: string; accent: string };
}
