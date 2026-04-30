import { useState } from 'react';
import ShapePanel from './ShapePanel';
import StickerPanel from './StickerPanel';
import LogoUploader from './LogoUploader';
import TextEditor from './TextEditor';
import AdjustPanel from './AdjustPanel';
import FilterPanel from './FilterPanel';
import DateStamp from './DateStamp';

type ToolId = 'shape' | 'stickers' | 'logo' | 'text' | 'adjust' | 'filter' | 'date';

interface ToolDef {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
}

/* ── SVG Icons (24×24, stroke style, consistent weight) ── */

const ShapeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l8.5 6.2-3.2 10.1H6.7L3.5 8.2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const TypeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const SlidersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.15" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TOOLS: ToolDef[] = [
  { id: 'shape', label: 'Shape', icon: <ShapeIcon /> },
  { id: 'stickers', label: 'Stickers', icon: <StarIcon /> },
  { id: 'logo', label: 'Logo', icon: <ImageIcon /> },
  { id: 'text', label: 'Text', icon: <TypeIcon /> },
  { id: 'adjust', label: 'Adjust', icon: <SlidersIcon /> },
  { id: 'filter', label: 'Filter', icon: <FilterIcon /> },
  { id: 'date', label: 'Date', icon: <CalendarIcon /> },
];

const PANEL_MAP: Record<ToolId, React.FC> = {
  shape: ShapePanel,
  stickers: StickerPanel,
  logo: LogoUploader,
  text: TextEditor,
  adjust: AdjustPanel,
  filter: FilterPanel,
  date: DateStamp,
};

export default function CustomizationToolbar() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const toggleTool = (id: ToolId) => {
    setActiveTool((prev) => (prev === id ? null : id));
  };

  const ActivePanel = activeTool ? PANEL_MAP[activeTool] : null;

  return (
    <div className="w-full" data-testid="customization-toolbar">
      {/* Active panel */}
      {ActivePanel && (
        <div
          className="mx-4 mb-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-h-64 overflow-y-auto"
          data-testid={`panel-${activeTool}`}
        >
          <ActivePanel />
        </div>
      )}

      {/* Tool buttons bar */}
      <div className="flex items-center justify-center gap-0.5 px-2 py-2 bg-black/30 backdrop-blur-md border-t border-white/10">
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer min-w-[48px] ${
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }`}
              data-testid={`tool-${tool.id}`}
              aria-pressed={isActive}
            >
              <span className="flex items-center justify-center">{tool.icon}</span>
              <span className="text-[9px] font-medium leading-tight">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
