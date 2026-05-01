import { useState } from 'react';
import type { ThemeConfig } from '../../types/theme';
import GlassCard from '../shared/GlassCard';

interface ThemeCardProps {
  theme: ThemeConfig;
  selected: boolean;
  onClick: () => void;
}

/** Tag badge color mapping */
const TAG_DOT_COLORS: Record<string, string> = {
  Signature: 'bg-amber-400',
  'Fan Fave': 'bg-pink-400',
  Creative: 'bg-emerald-400',
};

/** Preview gradient/color for each theme */
const PREVIEW_STYLES: Record<string, { background: string; decorHint: string }> = {
  'midnight-glimmer': {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1f3c 100%)',
    decorHint: '✦',
  },
  'sakura-y2k': {
    background: 'linear-gradient(135deg, #2d1b3d 0%, #4a2040 50%, #1f1030 100%)',
    decorHint: '✿',
  },
  'custom-studio': {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    decorHint: '✎',
  },
};

export default function ThemeCard({ theme, selected, onClick }: ThemeCardProps) {
  const [hovered, setHovered] = useState(false);

  const preview = PREVIEW_STYLES[theme.id] ?? {
    background: theme.background,
    decorHint: '◆',
  };

  const dotColor = TAG_DOT_COLORS[theme.tag] ?? 'bg-white/60';

  return (
    <GlassCard
      selected={selected}
      hovered={hovered}
      className="transition-all duration-150"
    >
      <button
        type="button"
        data-testid={`theme-card-${theme.id}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer outline-none focus:ring-2 focus:ring-accent/50 w-full h-full"
        aria-pressed={selected}
      >
        {/* Tag badge — top-right corner */}
        <span className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-[0.625rem] font-semibold text-white/80 tracking-wide z-10">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {theme.tag}
        </span>

        {/* Visual preview */}
        <div
          className="relative w-full rounded-xl overflow-hidden border border-white/10"
          style={{ height: '7.5rem', background: preview.background }}
          aria-hidden="true"
        >
          {/* Decoration hints */}
          <span className="absolute top-2 left-3 text-white/30 text-lg select-none">
            {preview.decorHint}
          </span>
          <span className="absolute bottom-2 right-3 text-white/20 text-sm select-none">
            {preview.decorHint}
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/15 text-2xl select-none">
            {preview.decorHint}
          </span>

          {/* Accent color bar at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: theme.accentColor }}
          />
        </div>

        {/* Theme label + selection indicator inline */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white tracking-wide">
            {theme.label}
          </span>
          {selected && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </span>
          )}
        </div>
      </button>
    </GlassCard>
  );
}
