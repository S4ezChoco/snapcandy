export type ThemeId =
  | 'midnight-glimmer'
  | 'sakura-y2k'
  | 'custom-studio'
  | 'neon-glow'
  | 'retro-90s'
  | 'pastel-dream'
  | 'dark-academia'
  | 'tropical-sunset'
  | 'minimalist-white'
  | 'vintage-film'
  | 'cyberpunk'
  | 'cottagecore';

export interface DecorationElement {
  type: 'star' | 'petal' | 'sparkle' | 'border-pattern' | 'heart' | 'geometric';
  position: { x: number; y: number };
  size: number;
  opacity: number;
}

export interface CustomStudioConfig {
  background: string;
  accent: string;
  borderWidth: number;      // 0-10
  borderColor: string;      // hex color
  decorations: {
    stars: boolean;
    sparkles: boolean;
    petals: boolean;
    hearts: boolean;
    geometric: boolean;
  };
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  tag: string; // e.g., "Signature", "Fan Fave", "Creative"
  background: string; // CSS gradient or color
  accentColor: string;
  decorations: DecorationElement[];
  customColors?: CustomStudioConfig;
}
