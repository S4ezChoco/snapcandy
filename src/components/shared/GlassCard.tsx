import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  hovered?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  selected = false,
  hovered = false,
}: GlassCardProps) {
  return (
    <div
      data-testid="glass-card"
      className={[
        'backdrop-blur-[12px] rounded-2xl border transition-all duration-150 overflow-hidden',
        selected
          ? 'bg-white/10 border-accent/60 shadow-md shadow-accent/10'
          : hovered
            ? 'bg-white/8 border-white/20 scale-[1.02]'
            : 'bg-white/5 border-white/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
