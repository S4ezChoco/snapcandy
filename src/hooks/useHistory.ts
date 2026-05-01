import { useRef, useState, useCallback, useEffect } from 'react';
import type { Customization } from '../types/customization';
import { usePhotoboothStore } from '../store/usePhotoboothStore';

const MAX_UNDO_ENTRIES = 30;

export interface UseHistoryReturn {
  pushState: (state: Customization) => void;
  undo: () => Customization | null;
  redo: () => Customization | null;
  canUndo: boolean;
  canRedo: boolean;
}

export function useHistory(): UseHistoryReturn {
  const undoStackRef = useRef<Customization[]>([]);
  const redoStackRef = useRef<Customization[]>([]);
  const isUndoRedoRef = useRef(false);
  const prevCustomizationsRef = useRef<Customization | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const pushState = useCallback((state: Customization) => {
    undoStackRef.current.push(state);
    if (undoStackRef.current.length > MAX_UNDO_ENTRIES) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    updateFlags();
  }, [updateFlags]);

  const undo = useCallback((): Customization | null => {
    if (undoStackRef.current.length === 0) return null;
    const previous = undoStackRef.current.pop()!;
    const current = usePhotoboothStore.getState().customizations;
    redoStackRef.current.push(current);
    isUndoRedoRef.current = true;
    updateFlags();
    return previous;
  }, [updateFlags]);

  const redo = useCallback((): Customization | null => {
    if (redoStackRef.current.length === 0) return null;
    const next = redoStackRef.current.pop()!;
    const current = usePhotoboothStore.getState().customizations;
    undoStackRef.current.push(current);
    if (undoStackRef.current.length > MAX_UNDO_ENTRIES) {
      undoStackRef.current.shift();
    }
    isUndoRedoRef.current = true;
    updateFlags();
    return next;
  }, [updateFlags]);

  // Subscribe to customization changes in the store to auto-push states
  useEffect(() => {
    // Initialize the previous customizations ref
    prevCustomizationsRef.current = usePhotoboothStore.getState().customizations;

    const unsubscribe = usePhotoboothStore.subscribe((state, prevState) => {
      if (state.customizations === prevState.customizations) return;

      // Skip auto-push when the change came from undo/redo
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        prevCustomizationsRef.current = state.customizations;
        return;
      }

      // Push the previous customization state onto the undo stack
      if (prevCustomizationsRef.current) {
        pushState(prevCustomizationsRef.current);
      }
      prevCustomizationsRef.current = state.customizations;
    });

    return unsubscribe;
  }, [pushState]);

  return { pushState, undo, redo, canUndo, canRedo };
}
