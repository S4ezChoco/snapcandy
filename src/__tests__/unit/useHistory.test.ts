import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../hooks/useHistory';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import type { Customization } from '../../types/customization';

const defaultCustomization: Customization = {
  stickers: [],
  textOverlays: [],
  filter: null,
  adjustments: { brightness: 0, contrast: 0, saturation: 0 },
  dateStamp: null,
  shape: { borderRadius: 0, borderWidth: 2, borderColor: '#ffffff' },
  logo: null,
};

function makeCustomization(overrides: Partial<Customization> = {}): Customization {
  return { ...defaultCustomization, ...overrides };
}

describe('useHistory', () => {
  beforeEach(() => {
    usePhotoboothStore.getState().resetAll();
  });

  describe('initial state', () => {
    it('starts with canUndo and canRedo as false', () => {
      const { result } = renderHook(() => useHistory());
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('undo on empty stack', () => {
    it('returns null when undo stack is empty', () => {
      const { result } = renderHook(() => useHistory());
      let undone: Customization | null = null;
      act(() => {
        undone = result.current.undo();
      });
      expect(undone).toBeNull();
    });
  });

  describe('redo on empty stack', () => {
    it('returns null when redo stack is empty', () => {
      const { result } = renderHook(() => useHistory());
      let redone: Customization | null = null;
      act(() => {
        redone = result.current.redo();
      });
      expect(redone).toBeNull();
    });
  });

  describe('auto-push on store customization change', () => {
    it('pushes previous state to undo stack when customizations change', () => {
      const { result } = renderHook(() => useHistory());

      expect(result.current.canUndo).toBe(false);

      // Make a change via the store
      act(() => {
        usePhotoboothStore.getState().updateCustomizations({ filter: 'sepia' });
      });

      expect(result.current.canUndo).toBe(true);
    });
  });

  describe('single undo/redo cycle', () => {
    it('undoes a single change and redoes it', () => {
      const { result } = renderHook(() => useHistory());

      // Make a change
      act(() => {
        usePhotoboothStore.getState().updateCustomizations({ filter: 'sepia' });
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // Undo
      let undone: Customization | null = null;
      act(() => {
        undone = result.current.undo();
        if (undone) {
          usePhotoboothStore.getState().updateCustomizations(undone);
        }
      });

      expect(undone).not.toBeNull();
      expect(undone!.filter).toBeNull(); // original state had no filter
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo
      let redone: Customization | null = null;
      act(() => {
        redone = result.current.redo();
        if (redone) {
          usePhotoboothStore.getState().updateCustomizations(redone);
        }
      });

      expect(redone).not.toBeNull();
      expect(redone!.filter).toBe('sepia');
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('new change after undo clears redo stack', () => {
    it('clears redo stack when a new change is made after undo', () => {
      const { result } = renderHook(() => useHistory());

      // Make two changes
      act(() => {
        usePhotoboothStore.getState().updateCustomizations({ filter: 'sepia' });
      });
      act(() => {
        usePhotoboothStore.getState().updateCustomizations({ filter: 'grayscale' });
      });

      // Undo once
      act(() => {
        const undone = result.current.undo();
        if (undone) {
          usePhotoboothStore.getState().updateCustomizations(undone);
        }
      });

      expect(result.current.canRedo).toBe(true);

      // Make a new change — should clear redo stack
      act(() => {
        usePhotoboothStore.getState().updateCustomizations({ filter: 'vintage' });
      });

      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('undo stack bounded at 30', () => {
    it('never exceeds 30 entries in the undo stack', () => {
      const { result } = renderHook(() => useHistory());

      // Make 35 changes
      for (let i = 0; i < 35; i++) {
        act(() => {
          usePhotoboothStore.getState().updateCustomizations({
            adjustments: { brightness: i, contrast: 0, saturation: 0 },
          });
        });
      }

      // Count how many undos we can perform
      let undoCount = 0;
      let undone: Customization | null;
      act(() => {
        undone = result.current.undo();
        while (undone !== null) {
          undoCount++;
          usePhotoboothStore.getState().updateCustomizations(undone);
          undone = result.current.undo();
        }
      });

      expect(undoCount).toBeLessThanOrEqual(30);
    });
  });

  describe('pushState directly', () => {
    it('pushes a state and enables undo', () => {
      const { result } = renderHook(() => useHistory());

      const state = makeCustomization({ filter: 'warm' });
      act(() => {
        result.current.pushState(state);
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('clears redo stack on pushState', () => {
      const { result } = renderHook(() => useHistory());

      // Push a state, then undo to get something in redo
      act(() => {
        result.current.pushState(makeCustomization({ filter: 'warm' }));
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      // Push a new state — redo should be cleared
      act(() => {
        result.current.pushState(makeCustomization({ filter: 'cool' }));
      });

      expect(result.current.canRedo).toBe(false);
    });
  });
});
