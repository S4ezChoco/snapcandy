import { useEffect, useRef } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import Toast from './Toast';

export default function ToastContainer() {
  const toasts = usePhotoboothStore((s) => s.toasts);
  const removeToast = usePhotoboothStore((s) => s.removeToast);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    const timers = timersRef.current;

    // Set up auto-dismiss timers for each toast that doesn't already have one
    for (const toast of toasts) {
      if (!timers.has(toast.id)) {
        const timer = setTimeout(() => {
          timers.delete(toast.id);
          removeToast(toast.id);
        }, toast.duration);
        timers.set(toast.id, timer);
      }
    }

    // Clean up timers for toasts that have been removed from the store
    for (const [id, timer] of timers) {
      if (!toasts.some((t) => t.id === id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    }
  }, [toasts, removeToast]);

  // Clean up all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
