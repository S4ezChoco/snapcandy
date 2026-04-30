import { usePhotoboothStore } from '../../store/usePhotoboothStore';

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function DateStamp() {
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);

  const isEnabled = customizations.dateStamp !== null;

  const toggleDateStamp = () => {
    if (isEnabled) {
      updateCustomizations({ dateStamp: null });
    } else {
      updateCustomizations({
        dateStamp: {
          format: formatDate(),
          x: 0.85,
          y: 0.96,
          color: '#ffffff',
          fontSize: 14,
        },
      });
    }
  };

  return (
    <div className="p-4 space-y-4" data-testid="date-stamp-panel">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Add Date Stamp</span>
        <button
          type="button"
          onClick={toggleDateStamp}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
            isEnabled ? 'bg-accent' : 'bg-white/10'
          }`}
          role="switch"
          aria-checked={isEnabled}
          data-testid="date-stamp-toggle"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Preview */}
      {isEnabled && (
        <div className="flex items-center justify-center py-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-sm text-white/70" data-testid="date-stamp-preview">
            {customizations.dateStamp?.format}
          </span>
        </div>
      )}
    </div>
  );
}
