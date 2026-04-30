interface CaptureButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function CaptureButton({ onClick, disabled = false }: CaptureButtonProps) {
  return (
    <button
      type="button"
      data-testid="capture-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Capture photo"
      className={[
        'relative w-20 h-20 rounded-full flex items-center justify-center',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/60',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-105 active:scale-95',
      ].join(' ')}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/80" />
      {/* Inner circle */}
      <div
        className={[
          'w-14 h-14 rounded-full transition-colors duration-150',
          disabled ? 'bg-white/20' : 'bg-white/90 hover:bg-white active:bg-accent',
        ].join(' ')}
      />
    </button>
  );
}
