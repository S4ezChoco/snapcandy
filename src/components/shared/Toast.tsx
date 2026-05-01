import { useEffect, useState } from 'react';
import type { ToastItem } from '../../types/ui';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastItem['type'], string> = {
  success:
    'border-green-500/40 bg-green-500/10 text-green-200',
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
  info: 'border-accent/40 bg-accent/10 text-accent',
};

const iconMap: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger exit animation, then remove after it completes
    if (exiting) {
      const timer = setTimeout(() => onDismiss(toast.id), 150);
      return () => clearTimeout(timer);
    }
  }, [exiting, onDismiss, toast.id]);

  const handleDismiss = () => {
    setExiting(true);
  };

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3',
        'backdrop-blur-[12px] shadow-lg',
        'transition-all duration-150',
        typeStyles[toast.type],
        exiting ? 'animate-toast-exit' : 'animate-toast-enter',
      ].join(' ')}
      style={{
        animationFillMode: 'both',
      }}
    >
      {/* Type icon */}
      <span className="flex-shrink-0 text-sm font-semibold" aria-hidden="true">
        {iconMap[toast.type]}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      {/* Optional action button */}
      {toast.action && (
        <button
          type="button"
          onClick={toast.action.onClick}
          className="flex-shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 transition-colors duration-150 cursor-pointer"
        >
          {toast.action.label}
        </button>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 ml-1 rounded-lg p-1 text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors duration-150 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
