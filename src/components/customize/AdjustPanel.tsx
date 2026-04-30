import { usePhotoboothStore } from '../../store/usePhotoboothStore';

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const ContrastIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" opacity="0.3" />
  </svg>
);

const DropletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const SLIDERS = [
  { key: 'brightness' as const, label: 'Brightness', icon: <SunIcon /> },
  { key: 'contrast' as const, label: 'Contrast', icon: <ContrastIcon /> },
  { key: 'saturation' as const, label: 'Saturation', icon: <DropletIcon /> },
];

export default function AdjustPanel() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const { adjustments } = customizations;

  const updateAdjustment = (key: keyof typeof adjustments, value: number) => {
    updateCustomizations({
      adjustments: { ...adjustments, [key]: value },
    });
  };

  const resetAll = () => {
    updateCustomizations({
      adjustments: { brightness: 0, contrast: 0, saturation: 0 },
    });
  };

  return (
    <div className="p-4 space-y-3" data-testid="adjust-panel">
      {SLIDERS.map(({ key, label, icon }) => {
        const val = adjustments[key];
        const pct = ((val + 100) / 200) * 100;
        return (
          <div key={key} className="space-y-1.5">
            <label className="flex items-center justify-between text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-white/50">{icon}</span>
                {label}
              </span>
              <span className="text-xs font-mono text-accent tabular-nums w-10 text-right">{val}</span>
            </label>
            <div className="relative h-6 flex items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />
              <div
                className="absolute h-1.5 rounded-full bg-accent/60"
                style={{
                  left: `${Math.min(pct, 50)}%`,
                  width: `${Math.abs(pct - 50)}%`,
                }}
              />
              <input
                type="range"
                min={-100}
                max={100}
                value={val}
                onChange={(e) => updateAdjustment(key, Number(e.target.value))}
                className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer"
                data-testid={`${key}-slider`}
              />
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-accent border-2 border-white shadow-sm pointer-events-none"
                style={{ left: `calc(${pct}% - 7px)` }}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={resetAll}
        className="w-full py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors cursor-pointer mt-1"
      >
        Reset All
      </button>
    </div>
  );
}
