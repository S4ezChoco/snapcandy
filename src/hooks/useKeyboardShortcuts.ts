import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface KeyboardShortcutCallbacks {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onCapture?: () => void;
}

/**
 * Returns true when the currently focused element is a text input,
 * textarea, or contenteditable — meaning most shortcuts should be
 * suppressed so the user can type normally.
 */
function isTextInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;

  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (el.getAttribute('contenteditable') === 'true') return true;

  return false;
}

/**
 * Hook that registers global keyboard shortcuts scoped to the current route.
 *
 * Shortcut map:
 * | Shortcut           | Screen     | Action              |
 * |--------------------|------------|---------------------|
 * | Ctrl/Cmd+Z         | /customize | Undo                |
 * | Ctrl/Cmd+Shift+Z   | /customize | Redo                |
 * | Ctrl/Cmd+S         | /export    | Save as JPG         |
 * | Escape             | Any        | Close panel/modal   |
 * | Enter              | /capture   | Trigger capture     |
 *
 * All shortcuts except Escape are suppressed when a text input,
 * textarea, or contenteditable element is focused.
 */
export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks): void {
  const { pathname } = useLocation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const textFocused = isTextInputFocused();

      // Escape — always active, even in text inputs
      if (e.key === 'Escape') {
        if (callbacks.onEscape) {
          e.preventDefault();
          callbacks.onEscape();
        }
        return;
      }

      // Guard: suppress all other shortcuts when a text input is focused
      if (textFocused) return;

      // Ctrl/Cmd+Shift+Z — Redo (check before Ctrl+Z since Shift is also pressed)
      if (mod && e.shiftKey && e.key.toLowerCase() === 'z') {
        if (pathname === '/customize' && callbacks.onRedo) {
          e.preventDefault();
          callbacks.onRedo();
        }
        return;
      }

      // Ctrl/Cmd+Z — Undo
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (pathname === '/customize' && callbacks.onUndo) {
          e.preventDefault();
          callbacks.onUndo();
        }
        return;
      }

      // Ctrl/Cmd+S — Save as JPG
      if (mod && e.key.toLowerCase() === 's') {
        if (pathname === '/export' && callbacks.onSave) {
          e.preventDefault();
          callbacks.onSave();
        } else {
          // Always prevent browser save dialog on handled screens
          e.preventDefault();
        }
        return;
      }

      // Enter — Trigger capture
      if (e.key === 'Enter') {
        if (pathname === '/capture' && callbacks.onCapture) {
          e.preventDefault();
          callbacks.onCapture();
        }
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pathname, callbacks]);
}
