import React, { useState } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import type { ImageAdjustments } from '../../types/customization';
import ConfirmationDialog from '../shared/ConfirmationDialog';

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

type AdjustmentKey = keyof ImageAdjustments;

type SliderConfig = {
  key: AdjustmentKey;
  label: string;
  icon?: React.ReactNode;
  min: number;
  max: number;
};

const GROUPS: Array<{ title: string; sliders: SliderConfig[] }> = [
  {
    title: 'Light',
    sliders: [
      { key: 'exposure', label: 'Exposure', icon: <SunIcon />, min: -100, max: 100 },
      { key: 'brightness', label: 'Brightness', icon: <SunIcon />, min: -100, max: 100 },
      { key: 'contrast', label: 'Contrast', icon: <ContrastIcon />, min: -100, max: 100 },
      { key: 'highlights', label: 'Highlights', icon: <SunIcon />, min: -100, max: 100 },
      { key: 'shadows', label: 'Shadows', icon: <ContrastIcon />, min: -100, max: 100 },
    ],
  },
  {
    title: 'Color',
    sliders: [
      { key: 'saturation', label: 'Saturation', icon: <DropletIcon />, min: -100, max: 100 },
      { key: 'temperature', label: 'Temperature', icon: <DropletIcon />, min: -100, max: 100 },
      { key: 'tint', label: 'Tint', icon: <DropletIcon />, min: -100, max: 100 },
    ],
  },
  {
    title: 'Effects',
    sliders: [
      { key: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
      { key: 'vignette', label: 'Vignette', min: 0, max: 100 },
      { key: 'grain', label: 'Grain', min: 0, max: 100 },
      { key: 'blur', label: 'Blur', min: 0, max: 100 },
      { key: 'fade', label: 'Fade', min: 0, max: 100 },
    ],
  },
];

export default function AdjustPanel() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const { adjustments } = customizations;

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const updateAdjustment = (key: AdjustmentKey, value: number) => {
    updateCustomizations({
      adjustments: { ...adjustments, [key]: value },
    });
  };

  const resetAll = () => {
    updateCustomizations({
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        sharpness: 0,
        vignette: 0,
        grain: 0,
        blur: 0,
        fade: 0,
      },
    });
  };

  return (
    <div className="p-4 space-y-3" data-testid="adjust-panel">
      {GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <div className="text-[11px] uppercase tracking-wide text-white/40">
            {group.title}
          </div>

          {group.sliders.map(({ key, label, icon, min, max }) => {
            const val = (adjustments[key] ?? 0) as number;
            const valuePct = ((val - min) / (max - min)) * 100;
            const zeroPctRaw = ((0 - min) / (max - min)) * 100;
            const zeroPct = Math.max(0, Math.min(100, zeroPctRaw));
            const left = Math.min(valuePct, zeroPct);
            const width = Math.abs(valuePct - zeroPct);

            return (
              <div key={key} className="space-y-2">
                <label className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    {icon && <span className="text-white/60">{icon}</span>}
                    {label}
                  </span>
                  <span className="text-xs font-mono text-accent tabular-nums w-10 text-right">{val}</span>
                </label>
                <div className="relative h-6 flex items-center">
                  <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />
                  <div
                    className="absolute h-1.5 rounded-full bg-accent/60"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={val}
                    onChange={(e) => updateAdjustment(key, Number(e.target.value))}
                    className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer"
                    data-testid={`${key}-slider`}
                  />
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-accent border-2 border-white shadow-sm pointer-events-none"
                    style={{ left: `calc(${valuePct}% - 0.4375rem)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setShowResetConfirm(true)}
        className="w-full py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/70 transition-colors duration-150 cursor-pointer mt-1"
      >
        Reset All
      </button>

      {/* Confirmation dialog for Reset All */}
      <ConfirmationDialog
        open={showResetConfirm}
        title="Reset All Adjustments?"
        message="This will reset all adjustment sliders to their default values."
        confirmLabel="Reset"
        variant="default"
        onConfirm={() => {
          setShowResetConfirm(false);
          resetAll();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
