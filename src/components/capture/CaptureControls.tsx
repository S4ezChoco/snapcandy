import type { CaptureSettings } from '../../types/capture';

interface CaptureControlsProps {
  settings: CaptureSettings;
  onSettingsChange: (updates: Partial<CaptureSettings>) => void;
}

export default function CaptureControls({
  settings,
  onSettingsChange,
}: CaptureControlsProps) {
  const timerOptions: Array<3 | 5 | 10> = [3, 5, 10];

  return (
    <div
      data-testid="capture-controls"
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Manual / Auto mode toggle */}
      <div className="flex rounded-full bg-white/5 border border-white/10 p-0.5">
        <button
          type="button"
          data-testid="mode-manual"
          onClick={() => onSettingsChange({ mode: 'manual' })}
          className={[
            'px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer',
            settings.mode === 'manual'
              ? 'bg-accent text-white shadow-sm'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5',
          ].join(' ')}
        >
          Manual
        </button>
        <button
          type="button"
          data-testid="mode-auto"
          onClick={() => onSettingsChange({ mode: 'auto' })}
          className={[
            'px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer',
            settings.mode === 'auto'
              ? 'bg-accent text-white shadow-sm'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5',
          ].join(' ')}
        >
          Auto
        </button>
      </div>

      {/* Timer interval selector */}
      <div className="flex rounded-full bg-white/5 border border-white/10 p-0.5">
        {timerOptions.map((sec) => (
          <button
            key={sec}
            type="button"
            data-testid={`timer-${sec}s`}
            onClick={() => onSettingsChange({ timerSeconds: sec })}
            className={[
              'px-3 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer',
              settings.timerSeconds === sec
                ? 'bg-accent text-white shadow-sm'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5',
            ].join(' ')}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Quality toggle */}
      <div className="flex rounded-full bg-white/5 border border-white/10 p-0.5">
        <button
          type="button"
          data-testid="quality-balanced"
          onClick={() => onSettingsChange({ quality: 'balanced' })}
          className={[
            'px-3 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer',
            settings.quality === 'balanced'
              ? 'bg-accent text-white shadow-sm'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5',
          ].join(' ')}
        >
          Bal
        </button>
        <button
          type="button"
          data-testid="quality-high"
          onClick={() => onSettingsChange({ quality: 'high' })}
          className={[
            'px-3 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer',
            settings.quality === 'high'
              ? 'bg-accent text-white shadow-sm'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5',
          ].join(' ')}
        >
          HQ
        </button>
      </div>

      {/* Mirror icon button */}
      <button
        type="button"
        data-testid="mirror-toggle"
        onClick={() => onSettingsChange({ mirrored: !settings.mirrored })}
        aria-label="Toggle mirror"
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-150 border cursor-pointer',
          settings.mirrored
            ? 'bg-accent/20 border-accent/40 text-accent'
            : 'bg-white/5 border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10',
        ].join(' ')}
      >
        ↔
      </button>

      {/* Fullscreen icon button */}
      <button
        type="button"
        data-testid="fullscreen-toggle"
        onClick={() => onSettingsChange({ fullscreen: !settings.fullscreen })}
        aria-label="Toggle fullscreen"
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-150 border cursor-pointer',
          settings.fullscreen
            ? 'bg-accent/20 border-accent/40 text-accent'
            : 'bg-white/5 border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10',
        ].join(' ')}
      >
        ⛶
      </button>
    </div>
  );
}
