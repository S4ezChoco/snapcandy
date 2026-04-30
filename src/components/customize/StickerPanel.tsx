import { usePhotoboothStore } from '../../store/usePhotoboothStore';

const STICKER_OPTIONS = [
  '❤️', '⭐', '🌟', '✨', '🎉', '🎀', '💖', '🌸',
  '🦋', '🌈', '🔥', '💫', '🎵', '🍀', '💎', '🌙',
  '🎈', '🌺', '💕', '⚡',
];

export default function StickerPanel() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);

  const addSticker = (emoji: string) => {
    // Randomize position so stickers don't all stack at center
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stickerId: emoji,
      x: 0.2 + Math.random() * 0.6, // random between 0.2 and 0.8
      y: 0.2 + Math.random() * 0.6,
      scale: 0.8 + Math.random() * 0.4, // random between 0.8 and 1.2
      rotation: Math.floor(Math.random() * 30) - 15, // -15 to +15 degrees
    };
    updateCustomizations({
      stickers: [...customizations.stickers, newSticker],
    });
  };

  const removeSticker = (id: string) => {
    updateCustomizations({
      stickers: customizations.stickers.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="p-3 space-y-3" data-testid="sticker-panel">
      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Tap to add to strip</p>
      {/* Sticker grid */}
      <div className="grid grid-cols-5 gap-1">
        {STICKER_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addSticker(emoji)}
            className="w-10 h-10 flex items-center justify-center text-lg rounded-md bg-white/[0.03] border border-white/[0.06] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-150 cursor-pointer"
            aria-label={`Add ${emoji} sticker`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Active stickers */}
      {customizations.stickers.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-xs text-white/40 mb-2 flex items-center justify-between">
            <span>Active</span>
            <span className="text-accent tabular-nums">{customizations.stickers.length}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {customizations.stickers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => removeSticker(s.id)}
                className="w-8 h-8 flex items-center justify-center text-base rounded-md bg-white/[0.06] hover:bg-red-500/20 hover:ring-1 hover:ring-red-500/30 transition-all cursor-pointer"
                aria-label={`Remove ${s.stickerId} sticker`}
                title="Click to remove"
              >
                {s.stickerId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
