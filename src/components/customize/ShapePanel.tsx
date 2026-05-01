import { usePhotoboothStore } from '../../store/usePhotoboothStore';

export default function ShapePanel() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const { shape } = customizations;

  const updateShape = (updates: Partial<typeof shape>) => {
    updateCustomizations({ shape: { ...shape, ...updates } });
  };

  return (
    <div className="p-4 space-y-4" data-testid="shape-panel">
      {/* Border Radius */}
      <div>
        <label className="flex items-center justify-between text-sm text-white/70 mb-1">
          <span>Border Radius</span>
          <span className="text-accent font-medium">{shape.borderRadius}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={50}
          value={shape.borderRadius}
          onChange={(e) => updateShape({ borderRadius: Number(e.target.value) })}
          className="w-full accent-accent"
          data-testid="border-radius-slider"
        />
      </div>

      {/* Border Width */}
      <div>
        <label className="flex items-center justify-between text-sm text-white/70 mb-1">
          <span>Border Width</span>
          <span className="text-accent font-medium">{shape.borderWidth}px</span>
        </label>
        <input
          type="range"
          min={0}
          max={10}
          value={shape.borderWidth}
          onChange={(e) => updateShape({ borderWidth: Number(e.target.value) })}
          className="w-full accent-accent"
          data-testid="border-width-slider"
        />
      </div>

      {/* Border Color */}
      <div>
        <label className="flex items-center justify-between text-sm text-white/70 mb-1">
          <span>Border Color</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={shape.borderColor}
            onChange={(e) => updateShape({ borderColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            data-testid="border-color-picker"
          />
          <span className="text-sm text-white/60 font-mono">{shape.borderColor}</span>
        </div>
      </div>
    </div>
  );
}
