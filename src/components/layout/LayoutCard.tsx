import { useState } from 'react';
import type { LayoutConfig } from '../../types/layout';
import GlassCard from '../shared/GlassCard';

interface LayoutCardProps {
  layout: LayoutConfig;
  selected: boolean;
  onClick: () => void;
  description: string;
}

/** Preview diagram dimensions (px) */
const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = 140;

export default function LayoutCard({
  layout,
  selected,
  onClick,
  description,
}: LayoutCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <GlassCard
      selected={selected}
      hovered={hovered}
      className="transition-all duration-200"
    >
      <button
        type="button"
        data-testid={`layout-card-${layout.type}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer outline-none focus:ring-2 focus:ring-accent/50 w-full h-full"
        aria-pressed={selected}
      >
        {/* Selection checkmark — inside card bounds */}
        {selected && (
          <span
            className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shadow-md z-10"
            aria-label="Selected"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          </span>
        )}

        {/* Visual preview diagram */}
        <div
          className="relative rounded-lg overflow-hidden border border-white/10"
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          aria-hidden="true"
        >
          {/* Dark background for the preview area */}
          <div className="absolute inset-0 bg-white/5" />

          {/* Photo position rectangles */}
          {layout.positions.map((pos, i) => (
            <div
              key={i}
              className={[
                'absolute rounded-sm transition-colors duration-200',
                selected
                  ? 'bg-accent/40 border border-accent/60'
                  : 'bg-white/15 border border-white/20',
              ].join(' ')}
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                width: `${pos.width * 100}%`,
                height: `${pos.height * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Label */}
        <span className="text-sm font-semibold text-white tracking-wide">
          {layout.label}
        </span>

        {/* Description */}
        <span className="text-xs text-white/50">{description}</span>
      </button>
    </GlassCard>
  );
}
