import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ThemeId } from '../../types/theme';
import { THEME_PRESETS } from '../../config/themes';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import ThemeCard from './ThemeCard';
import ColorPicker from './ColorPicker';

export default function ThemeSelector() {
  const navigate = useNavigate();
  const setTheme = usePhotoboothStore((s) => s.setTheme);
  const storedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const storedLayout = usePhotoboothStore((s) => s.selectedLayout);

  const [selectedId, setSelectedId] = useState<ThemeId | null>(
    storedTheme?.id ?? null,
  );

  const [customColors, setCustomColors] = useState<{ background: string; accent: string }>(
    storedTheme?.id === 'custom-studio' && storedTheme.customColors
      ? storedTheme.customColors
      : { background: '#1a1a2e', accent: '#e07a5f' },
  );

  const handleNext = () => {
    const chosen = THEME_PRESETS.find((t) => t.id === selectedId);
    if (!chosen) return;

    // For Custom Studio, merge in user-chosen colors
    if (chosen.id === 'custom-studio') {
      setTheme({
        ...chosen,
        background: `linear-gradient(135deg, ${customColors.background} 0%, ${customColors.background}cc 100%)`,
        accentColor: customColors.accent,
        customColors,
      });
    } else {
      setTheme(chosen);
    }

    navigate('/capture');
  };

  const handleBack = () => {
    navigate('/layout');
  };

  return (
    <div
      data-testid="theme-selector"
      className="flex flex-col items-center px-6 py-10 max-w-5xl mx-auto"
    >
      {/* Breadcrumb */}
      {storedLayout && (
        <p className="text-xs text-white/60 mb-4 tracking-wide">
          Layout &gt; <span className="text-white/60">{storedLayout.label}</span>
        </p>
      )}

      {/* Header */}
      <p className="text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-2">
        Step 2 of 6
      </p>
      <h1 className="font-heading text-4xl md:text-5xl text-white mb-3">
        Pick Your{' '}
        <span className="text-accent italic">Vibe</span>
      </h1>
      <p className="text-white/60 text-sm md:text-base mb-10 text-center max-w-md">
        Choose a visual theme for your photo strip — or create your own.
      </p>

      {/* Theme cards */}
      <div
        className="flex gap-5 overflow-x-auto pb-4 w-full justify-center flex-wrap"
        role="radiogroup"
        aria-label="Theme options"
      >
        {THEME_PRESETS.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={selectedId === theme.id}
            onClick={() => setSelectedId(theme.id)}
          />
        ))}
      </div>

      {/* Custom Studio color picker */}
      {selectedId === 'custom-studio' && (
        <div className="mt-6 w-full max-w-md animate-fade-slide-in">
          <ColorPicker
            background={customColors.background}
            accent={customColors.accent}
            onChange={setCustomColors}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-4 mt-10">
        <button
          type="button"
          data-testid="theme-back-button"
          onClick={handleBack}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          &lt; Change Layout
        </button>

        <button
          type="button"
          data-testid="theme-next-button"
          disabled={selectedId === null}
          onClick={handleNext}
          className={[
            'rounded-full px-10 py-3 text-base font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-teal',
            selectedId !== null
              ? 'bg-accent text-white shadow-md shadow-accent/30 hover:scale-105 hover:shadow-lg hover:shadow-accent/40 cursor-pointer'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          Next
        </button>
      </div>
    </div>
  );
}
