interface ColorPickerProps {
  background: string;
  accent: string;
  onChange: (colors: { background: string; accent: string }) => void;
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="flex items-center gap-3">
      {/* Swatch preview */}
      <span
        className="inline-block h-8 w-8 rounded-lg border border-white/20 shrink-0"
        style={{ backgroundColor: value }}
      />

      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-20 cursor-pointer rounded border border-white/10 bg-white/5 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded"
        />
      </span>
    </label>
  );
}

export default function ColorPicker({ background, accent, onChange }: ColorPickerProps) {
  return (
    <div
      data-testid="color-picker"
      className="flex flex-wrap gap-6 rounded-xl bg-white/5 border border-white/10 px-5 py-4"
    >
      <ColorField
        label="Background Color"
        value={background}
        onChange={(bg) => onChange({ background: bg, accent })}
      />
      <ColorField
        label="Accent Color"
        value={accent}
        onChange={(acc) => onChange({ background, accent: acc })}
      />
    </div>
  );
}
