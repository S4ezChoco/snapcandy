import { useEffect, useRef, useCallback } from 'react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Show/close the native dialog based on the `open` prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      // Save the element that triggered the dialog so we can restore focus later
      triggerRef.current = document.activeElement;

      if (!dialog.open) {
        dialog.showModal();
      }

      // Focus the cancel button as the safe default
      cancelButtonRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }

      // Restore focus to the triggering element
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [open]);

  // Focus trap: cycle Tab within the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onCancel],
  );

  // Prevent the native dialog cancel event from closing without our handler
  const handleNativeCancel = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onCancel();
    },
    [onCancel],
  );

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20'
      : 'bg-accent hover:bg-accent/90 text-dark-teal shadow-sm shadow-accent/20';

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onCancel={handleNativeCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
      className={[
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'bg-transparent p-0 m-auto',
        'max-w-md w-full',
        open ? '' : 'hidden',
      ].join(' ')}
    >
      <div className="rounded-2xl border border-white/10 bg-navy/95 backdrop-blur-[12px] p-6 shadow-xl">
        {/* Title */}
        <h2
          id="confirmation-dialog-title"
          className="text-lg font-semibold text-white mb-2"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirmation-dialog-message"
          className="text-sm text-white/70 mb-6 leading-relaxed"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 bg-white/10 hover:bg-white/15 transition-colors duration-150 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer',
              confirmButtonClass,
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
