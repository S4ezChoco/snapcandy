import { useState } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Monospace', value: 'monospace' },
];

export default function TextEditor() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const addToast = usePhotoboothStore((s) => s.addToast);

  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#ffffff');

  const addText = () => {
    if (!text.trim()) return;

    const newOverlay = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: text.trim(),
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      fontFamily,
      fontSize,
      color,
      rotation: 0,
    };

    updateCustomizations({
      textOverlays: [...customizations.textOverlays, newOverlay],
    });
    setText('');
    addToast({ type: 'info', message: 'Text added', duration: 2000 });
  };

  const removeText = (id: string) => {
    updateCustomizations({
      textOverlays: customizations.textOverlays.filter((t) => t.id !== id),
    });
  };

  return (
    <div className="p-4 space-y-4" data-testid="text-editor">
      {/* Text input */}
      <div>
        <label className="text-sm text-white/70 mb-1 block">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text..."
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent/50"
          data-testid="text-input"
        />
      </div>

      {/* Font selector */}
      <div>
        <label className="text-sm text-white/70 mb-1 block">Font</label>
        <div className="flex gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => setFontFamily(font.value)}
              className={`flex-1 py-2 text-sm rounded-xl border transition-all duration-150 cursor-pointer ${
                fontFamily === font.value
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="flex items-center justify-between text-sm text-white/70 mb-1">
          <span>Size</span>
          <span className="text-accent font-medium">{fontSize}px</span>
        </label>
        <input
          type="range"
          min={12}
          max={72}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-accent"
          data-testid="font-size-slider"
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="text-sm text-white/70 mb-1 block">Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            data-testid="text-color-picker"
          />
          <span className="text-sm text-white/60 font-mono">{color}</span>
        </div>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addText}
        disabled={!text.trim()}
        className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
        data-testid="add-text-button"
      >
        Add Text
      </button>

      {/* Active text overlays */}
      {customizations.textOverlays.length > 0 && (
        <div>
          <p className="text-xs text-white/60 mb-2">
            Active ({customizations.textOverlays.length})
          </p>
          <div className="space-y-1">
            {customizations.textOverlays.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-sm text-white/70 truncate mr-2" style={{ fontFamily: t.fontFamily }}>
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeText(t.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors duration-150 cursor-pointer shrink-0"
                  aria-label={`Remove text: ${t.text}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
