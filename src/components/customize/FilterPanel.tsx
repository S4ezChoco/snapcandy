import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import type { FilterType } from '../../types/customization';

interface FilterOption {
  type: FilterType | null;
  label: string;
  gradient: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { type: null, label: 'None', gradient: 'linear-gradient(135deg, #666 0%, #999 100%)' },
  { type: 'grayscale', label: 'Grayscale', gradient: 'linear-gradient(135deg, #333 0%, #888 100%)' },
  { type: 'sepia', label: 'Sepia', gradient: 'linear-gradient(135deg, #704214 0%, #c4956a 100%)' },
  { type: 'vintage', label: 'Vintage', gradient: 'linear-gradient(135deg, #8b6914 0%, #d4a853 100%)' },
  { type: 'warm', label: 'Warm', gradient: 'linear-gradient(135deg, #e07a5f 0%, #f4a261 100%)' },
  { type: 'cool', label: 'Cool', gradient: 'linear-gradient(135deg, #4a90d9 0%, #5eead4 100%)' },
];

export default function FilterPanel() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const setPreviewFilter = usePhotoboothStore((s) => s.setPreviewFilter);

  const activeFilter = customizations.filter;

  const handleMouseEnter = (filter: FilterType | null) => {
    // Only show preview if hovering over a different filter than the committed one
    setPreviewFilter(filter);
  };

  const handleMouseLeave = () => {
    // Revert preview to committed filter
    setPreviewFilter(undefined);
  };

  const handleClick = (filter: FilterType | null) => {
    // Commit the filter to the store and clear preview
    setPreviewFilter(undefined);
    updateCustomizations({ filter });
  };

  return (
    <div className="p-4" data-testid="filter-panel">
      <div className="grid grid-cols-3 gap-2">
        {FILTER_OPTIONS.map(({ type, label, gradient }) => {
          const isActive = activeFilter === type;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleClick(type)}
              onMouseEnter={() => handleMouseEnter(type)}
              onMouseLeave={handleMouseLeave}
              className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/10'
              }`}
              data-testid={`filter-${label.toLowerCase()}`}
            >
              <div
                className="w-8 h-8 rounded-full border border-white/20"
                style={{ background: gradient }}
              />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
