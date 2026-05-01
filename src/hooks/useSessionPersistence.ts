import { useEffect, useRef, useState } from 'react';
import { usePhotoboothStore } from '../store/usePhotoboothStore';
import {
  serializeSession,
  deserializeSession,
  STORAGE_KEY,
} from '../utils/sessionStorage';

interface SessionPersistenceResult {
  restoredStep: number | null;
  hadPhotos: boolean;
  isRestoring: boolean;
}

/**
 * Checks whether localStorage is available and writable.
 * Returns false in private browsing modes or when storage is disabled.
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__snapcandy_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes the session data from localStorage.
 * Safe to call even when localStorage is unavailable.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore — localStorage may be unavailable
  }
}

/**
 * Hook that persists Zustand store state to localStorage with a 500ms debounce,
 * and restores saved state on mount.
 *
 * Returns `{ restoredStep, hadPhotos, isRestoring }` so the consuming component (App.tsx)
 * can navigate to the restored step, show a recovery prompt when photos
 * were present but could not be serialized, and display a loading skeleton
 * during session restoration.
 */
export function useSessionPersistence(): SessionPersistenceResult {
  const [result, setResult] = useState<SessionPersistenceResult>({
    restoredStep: null,
    hadPhotos: false,
    isRestoring: true,
  });

  const storageAvailable = useRef<boolean>(false);
  const hasRestored = useRef(false);

  // Restore session on mount (runs once)
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    storageAvailable.current = isLocalStorageAvailable();

    // If localStorage is unavailable, no session to restore
    if (!storageAvailable.current) {
      setResult((prev) => ({ ...prev, isRestoring: false }));
      return;
    }

    let didRestore = false;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setResult((prev) => ({ ...prev, isRestoring: false }));
        return;
      }

      const session = deserializeSession(raw);
      if (!session) {
        // Invalid data — discard it
        localStorage.removeItem(STORAGE_KEY);
        setResult((prev) => ({ ...prev, isRestoring: false }));
        return;
      }

      // Restore serializable state into the store
      const store = usePhotoboothStore.getState();
      if (session.selectedLayout) store.setLayout(session.selectedLayout);
      if (session.selectedTheme) store.setTheme(session.selectedTheme);
      store.setCaptureSettings(session.captureSettings);
      store.updateCustomizations(session.customizations);
      store.goToStep(session.currentStep);

      didRestore = true;

      setResult({
        restoredStep: session.currentStep,
        hadPhotos: session.hadPhotos,
        isRestoring: true,
      });
    } catch {
      // If anything goes wrong during restore, discard and start fresh
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
      setResult((prev) => ({ ...prev, isRestoring: false }));
      return;
    }

    // Show skeleton for a brief period (max 500ms) when a session was restored
    if (didRestore) {
      const timer = setTimeout(() => {
        setResult((prev) => ({ ...prev, isRestoring: false }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Subscribe to store changes and persist with 500ms debounce
  useEffect(() => {
    if (!storageAvailable.current) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = usePhotoboothStore.subscribe((state) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        try {
          const json = serializeSession(state);
          localStorage.setItem(STORAGE_KEY, json);
        } catch (err: unknown) {
          if (
            err instanceof DOMException &&
            err.name === 'QuotaExceededError'
          ) {
            console.warn(
              '[SnapCandy] localStorage quota exceeded — session persistence disabled for this write.'
            );
            // Show info toast
            try {
              usePhotoboothStore
                .getState()
                .addToast({
                  type: 'info',
                  message:
                    'Storage is full. Your session may not be saved.',
                  duration: 3000,
                });
            } catch {
              // Ignore toast errors
            }
          }
          // For any other error, silently ignore
        }
        timeoutId = null;
      }, 500);
    });

    return () => {
      unsubscribe();
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return result;
}
