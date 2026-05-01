import { useState, useCallback } from 'react';
import type { CustomStudioConfig } from '../../types/theme';

interface ColorPickerProps {
  config: CustomStudioConfig;
  onChange: (config: CustomStudioConfig) => void;
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

function isValidHex(value: string): boolean {
  return HEX_COLOR_REGEX.test(value);
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [hexInput, setHexInput] = useState(value);
  const [hasError, setHasError] = useState(false);

  // Keep local input in sync when the parent value changes (e.g. via native picker)
  const handleNativeChange = useCallback(
    (newValue: string) => {
      setHexInput(newValue);
      setHasError(false);
      onChange(newValue);
    },
    [onChange],
  );

  const commitHexInput = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().toLowerCase();
      // Allow user to omit the leading #
      const candidate = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

      if (isValidHex(candidate)) {
        setHexInput(candidate);
        setHasError(false);
        onChange(candidate);
      } else {
        setHasError(true);
      }
    },
    [onChange],
  );

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    // Clear error as user types
    if (hasError) setHasError(false);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitHexInput(hexInput);
    }
  };

  const handleHexBlur = () => {
    commitHexInput(hexInput);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Swatch preview */}
      <span
        className="inline-block h-8 w-8 rounded-lg border border-white/20 shrink-0"
        style={{ backgroundColor: value }}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs text-white/60 font-medium" id={`color-label-${label.replace(/\s+/g, '-').toLowerCase()}`}>
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Native color picker */}
          <label className="sr-only" htmlFor={`native-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            {label} picker
          </label>
          <input
            id={`native-${label.replace(/\s+/g, '-').toLowerCase()}`}
            type="color"
            value={value}
            onChange={(e) => handleNativeChange(e.target.value)}
            className="h-7 w-10 cursor-pointer rounded border border-white/10 bg-white/5 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]/60 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label={`${label} picker`}
          />

          {/* Hex text input */}
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onKeyDown={handleHexKeyDown}
            onBlur={handleHexBlur}
            placeholder="#000000"
            maxLength={7}
            aria-label={`${label} hex value`}
            aria-describedby={hasError ? `hex-error-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined}
            aria-invalid={hasError || undefined}
            className={`h-7 w-22 rounded-lg border px-2 text-xs font-mono text-white bg-white/5 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f4a261]/60 focus:ring-offset-2 focus:ring-offset-transparent ${
              hasError ? 'border-red-400/60' : 'border-white/10'
            }`}
          />
        </div>

        {hasError && (
          <span
            id={`hex-error-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-[0.625rem] text-red-400/80"
            role="alert"
          >
            Invalid hex color
          </span>
        )}
      </div>
    </div>
  );
}

const DECORATION_OPTIONS: { key: keyof CustomStudioConfig['decorations']; label: string; icon: string }[] = [
  { key: 'stars', label: 'Stars', icon: '★' },
  { key: 'sparkles', label: 'Sparkles', icon: '✦' },
  { key: 'petals', label: 'Petals', icon: '❀' },
  { key: 'hearts', label: 'Hearts', icon: '♥' },
  { key: 'geometric', label: 'Geometric', icon: '◆' },
];

export default function ColorPicker({ config, onChange }: ColorPickerProps) {
  const updateField = <K extends keyof CustomStudioConfig>(key: K, value: CustomStudioConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const toggleDecoration = (key: keyof CustomStudioConfig['decorations']) => {
    onChange({
      ...config,
      decorations: {
        ...config.decorations,
        [key]: !config.decorations[key],
      },
    });
  };

  return (
    <div
      data-testid="color-picker"
      className="flex flex-col gap-5 rounded-xl bg-white/5 border border-white/10 px-5 py-4"
    >
      {/* Color pickers */}
      <div className="flex flex-wrap gap-6">
        <ColorField
          label="Background Color"
          value={config.background}
          onChange={(bg) => updateField('background', bg)}
        />
        <ColorField
          label="Accent Color"
          value={config.accent}
          onChange={(acc) => updateField('accent', acc)}
        />
      </div>

      {/* Border controls */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Border Style</span>
        <div className="flex flex-wrap items-end gap-6">
          {/* Border width slider */}
          <div className="flex flex-col gap-1">
            <label htmlFor="border-width-slider" className="text-xs text-white/50">
              Width: {config.borderWidth}px
            </label>
            <input
              id="border-width-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={config.borderWidth}
              onChange={(e) => updateField('borderWidth', Number(e.target.value))}
              className="w-32 accent-[#f4a261] cursor-pointer"
              aria-label="Border width"
            />
          </div>
          {/* Border color picker */}
          <ColorField
            label="Border Color"
            value={config.borderColor}
            onChange={(c) => updateField('borderColor', c)}
          />
        </div>
      </div>

      {/* Decoration toggles */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Decorations</span>
        <div className="flex flex-wrap gap-2">
          {DECORATION_OPTIONS.map(({ key, label, icon }) => {
            const active = config.decorations[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDecoration(key)}
                aria-pressed={active}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-[#f4a261]/60 focus:ring-offset-2 focus:ring-offset-transparent',
                  active
                    ? 'bg-[#f4a261]/20 text-[#f4a261] border border-[#f4a261]/40'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70',
                ].join(' ')}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
