import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LayoutConfig, LayoutType } from '../../types/layout';
import { LAYOUT_LIST } from '../../config/layouts';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import LayoutCard from './LayoutCard';

/** Human-readable descriptions for each layout type */
const LAYOUT_DESCRIPTIONS: Record<LayoutType, string> = {
  'classic-strip': '3 photos · vertical',
  'tall-strip': '4 photos · vertical',
  polaroid: '1 photo · large print',
  '2x2-grid': '4 photos · square grid',
  '4x6-layout': '6 photos · standard print',
};

export default function LayoutSelector() {
  const navigate = useNavigate();
  const setLayout = usePhotoboothStore((s) => s.setLayout);
  const storedLayout = usePhotoboothStore((s) => s.selectedLayout);

  const [selectedType, setSelectedType] = useState<LayoutType | null>(
    storedLayout?.type ?? null,
  );

  const handleSelect = (layout: LayoutConfig) => {
    setSelectedType(layout.type);
  };

  const handleNext = () => {
    const chosen = LAYOUT_LIST.find((l) => l.type === selectedType);
    if (!chosen) return;
    setLayout(chosen);
    navigate('/theme');
  };

  return (
    <div
      data-testid="layout-selector"
      className="flex flex-col items-center px-6 py-10 max-w-5xl mx-auto"
    >
      {/* Header */}
      <p className="text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-2">
        Step 1 of 2
      </p>
      <h1 className="font-heading text-4xl md:text-5xl text-white mb-3">
        Choose Your{' '}
        <span className="text-accent italic">Layout</span>
      </h1>
      <p className="text-white/60 text-sm md:text-base mb-10 text-center max-w-md">
        Pick how your photos will be arranged on the final strip.
      </p>

      {/* Layout cards — horizontal scrollable row */}
      <div
        className="flex gap-5 overflow-x-auto pb-4 w-full justify-center flex-wrap"
        role="radiogroup"
        aria-label="Layout options"
      >
        {LAYOUT_LIST.map((layout) => (
          <LayoutCard
            key={layout.type}
            layout={layout}
            selected={selectedType === layout.type}
            onClick={() => handleSelect(layout)}
            description={LAYOUT_DESCRIPTIONS[layout.type]}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        type="button"
        data-testid="layout-next-button"
        disabled={selectedType === null}
        onClick={handleNext}
        className={[
          'mt-10 rounded-full px-10 py-3 text-base font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-teal',
          selectedType !== null
            ? 'bg-accent text-white shadow-md shadow-accent/30 hover:scale-105 hover:shadow-lg hover:shadow-accent/40 cursor-pointer'
            : 'bg-white/10 text-white/30 cursor-not-allowed',
        ].join(' ')}
      >
        Next
      </button>
    </div>
  );
}
