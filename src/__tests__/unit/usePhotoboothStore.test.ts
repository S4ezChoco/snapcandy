import { describe, it, expect, beforeEach } from 'vitest';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { CapturedPhoto } from '../../types/capture';

describe('usePhotoboothStore', () => {
  beforeEach(() => {
    usePhotoboothStore.getState().resetAll();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = usePhotoboothStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.selectedLayout).toBeNull();
      expect(state.selectedTheme).toBeNull();
      expect(state.capturedPhotos).toEqual([]);
      expect(state.retakeIndex).toBeNull();
      expect(state.isExporting).toBe(false);
      expect(state.exportProgress).toBe(0);
    });

    it('has correct default capture settings', () => {
      const { captureSettings } = usePhotoboothStore.getState();
      expect(captureSettings.mode).toBe('manual');
      expect(captureSettings.timerSeconds).toBe(3);
      expect(captureSettings.mirrored).toBe(true);
      expect(captureSettings.fullscreen).toBe(false);
      expect(captureSettings.quality).toBe('balanced');
    });

    it('has correct default customizations', () => {
      const { customizations } = usePhotoboothStore.getState();
      expect(customizations.stickers).toEqual([]);
      expect(customizations.textOverlays).toEqual([]);
      expect(customizations.filter).toBeNull();
      expect(customizations.adjustments).toEqual({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        sharpness: 0,
        vignette: 0,
        grain: 0,
        blur: 0,
        fade: 0,
      });
      expect(customizations.dateStamp).toBeNull();
      expect(customizations.shape).toEqual({ borderRadius: 0, borderWidth: 2, borderColor: '#ffffff' });
      expect(customizations.logo).toBeNull();
    });
  });

  describe('setLayout', () => {
    it('stores the selected layout', () => {
      const layout: LayoutConfig = {
        type: 'classic-strip',
        label: 'Classic Strip',
        photoCount: 3,
        stripAspectRatio: 0.33,
        positions: [
          { x: 0.05, y: 0.02, width: 0.9, height: 0.3 },
          { x: 0.05, y: 0.35, width: 0.9, height: 0.3 },
          { x: 0.05, y: 0.68, width: 0.9, height: 0.3 },
        ],
      };
      usePhotoboothStore.getState().setLayout(layout);
      expect(usePhotoboothStore.getState().selectedLayout).toEqual(layout);
    });
  });

  describe('setTheme', () => {
    it('stores the selected theme', () => {
      const theme: ThemeConfig = {
        id: 'midnight-glimmer',
        label: 'Midnight Glimmer',
        tag: 'Signature',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1f3c 100%)',
        accentColor: '#f4a261',
        decorations: [],
      };
      usePhotoboothStore.getState().setTheme(theme);
      expect(usePhotoboothStore.getState().selectedTheme).toEqual(theme);
    });
  });

  describe('addPhoto / replacePhoto / clearPhotos', () => {
    const makePhoto = (index: number): CapturedPhoto => ({
      id: `photo-${index}`,
      index,
      blobUrl: `blob:http://localhost/${index}`,
      imageData: { data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' } as unknown as ImageData,
      timestamp: Date.now(),
    });

    it('adds photos to the array', () => {
      const store = usePhotoboothStore.getState();
      store.addPhoto(makePhoto(0));
      store.addPhoto(makePhoto(1));
      expect(usePhotoboothStore.getState().capturedPhotos).toHaveLength(2);
    });

    it('replaces a photo at a specific index and clears retakeIndex', () => {
      const store = usePhotoboothStore.getState();
      store.addPhoto(makePhoto(0));
      store.addPhoto(makePhoto(1));

      const replacement = makePhoto(0);
      replacement.id = 'replacement';
      store.replacePhoto(0, replacement);

      const state = usePhotoboothStore.getState();
      expect(state.capturedPhotos[0].id).toBe('replacement');
      expect(state.capturedPhotos[1].id).toBe('photo-1');
      expect(state.retakeIndex).toBeNull();
    });

    it('clears all photos and retakeIndex', () => {
      const store = usePhotoboothStore.getState();
      store.addPhoto(makePhoto(0));
      store.clearPhotos();
      const state = usePhotoboothStore.getState();
      expect(state.capturedPhotos).toEqual([]);
      expect(state.retakeIndex).toBeNull();
    });
  });

  describe('setCaptureSettings', () => {
    it('partially updates capture settings', () => {
      usePhotoboothStore.getState().setCaptureSettings({ mode: 'auto', timerSeconds: 5 });
      const { captureSettings } = usePhotoboothStore.getState();
      expect(captureSettings.mode).toBe('auto');
      expect(captureSettings.timerSeconds).toBe(5);
      expect(captureSettings.mirrored).toBe(true); // unchanged
    });
  });

  describe('updateCustomizations', () => {
    it('partially updates customizations', () => {
      usePhotoboothStore.getState().updateCustomizations({ filter: 'sepia' });
      const { customizations } = usePhotoboothStore.getState();
      expect(customizations.filter).toBe('sepia');
      expect(customizations.stickers).toEqual([]); // unchanged
    });
  });

  describe('goToStep', () => {
    it('updates the current step', () => {
      usePhotoboothStore.getState().goToStep(3);
      expect(usePhotoboothStore.getState().currentStep).toBe(3);
    });
  });

  describe('resetAll', () => {
    it('resets all state to defaults', () => {
      const store = usePhotoboothStore.getState();
      store.goToStep(4);
      store.setLayout({
        type: 'polaroid',
        label: 'Polaroid',
        photoCount: 1,
        stripAspectRatio: 0.83,
        positions: [{ x: 0.08, y: 0.05, width: 0.84, height: 0.72 }],
      });
      store.updateCustomizations({ filter: 'grayscale' });

      store.resetAll();

      const state = usePhotoboothStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.selectedLayout).toBeNull();
      expect(state.selectedTheme).toBeNull();
      expect(state.capturedPhotos).toEqual([]);
      expect(state.customizations.filter).toBeNull();
      expect(state.isExporting).toBe(false);
      expect(state.exportProgress).toBe(0);
    });
  });

  describe('toast slice', () => {
    it('starts with an empty toasts array', () => {
      const state = usePhotoboothStore.getState();
      expect(state.toasts).toEqual([]);
    });

    it('addToast adds a toast with generated id and createdAt', () => {
      const store = usePhotoboothStore.getState();
      store.addToast({ type: 'success', message: 'Saved!', duration: 3000 });

      const state = usePhotoboothStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe('success');
      expect(state.toasts[0].message).toBe('Saved!');
      expect(state.toasts[0].duration).toBe(3000);
      expect(state.toasts[0].id).toBeDefined();
      expect(state.toasts[0].id.length).toBeGreaterThan(0);
      expect(state.toasts[0].createdAt).toBeGreaterThan(0);
    });

    it('addToast generates unique ids for each toast', () => {
      const store = usePhotoboothStore.getState();
      store.addToast({ type: 'success', message: 'First', duration: 3000 });
      store.addToast({ type: 'error', message: 'Second', duration: 5000 });

      const state = usePhotoboothStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });

    it('addToast preserves optional action field', () => {
      const store = usePhotoboothStore.getState();
      const action = { label: 'Try Again', onClick: () => {} };
      store.addToast({ type: 'error', message: 'Failed', duration: 5000, action });

      const state = usePhotoboothStore.getState();
      expect(state.toasts[0].action).toBeDefined();
      expect(state.toasts[0].action!.label).toBe('Try Again');
    });

    it('removeToast removes a toast by id', () => {
      const store = usePhotoboothStore.getState();
      store.addToast({ type: 'success', message: 'First', duration: 3000 });
      store.addToast({ type: 'info', message: 'Second', duration: 2000 });

      const toasts = usePhotoboothStore.getState().toasts;
      expect(toasts).toHaveLength(2);

      store.removeToast(toasts[0].id);
      const updated = usePhotoboothStore.getState().toasts;
      expect(updated).toHaveLength(1);
      expect(updated[0].message).toBe('Second');
    });

    it('removeToast is a no-op for non-existent id', () => {
      const store = usePhotoboothStore.getState();
      store.addToast({ type: 'success', message: 'Test', duration: 3000 });
      store.removeToast('non-existent-id');

      expect(usePhotoboothStore.getState().toasts).toHaveLength(1);
    });

    it('caps visible toasts at 5 by removing oldest', () => {
      const store = usePhotoboothStore.getState();
      for (let i = 0; i < 7; i++) {
        store.addToast({ type: 'info', message: `Toast ${i}`, duration: 2000 });
      }

      const state = usePhotoboothStore.getState();
      expect(state.toasts).toHaveLength(5);
      // The oldest two (Toast 0, Toast 1) should have been removed
      expect(state.toasts[0].message).toBe('Toast 2');
      expect(state.toasts[4].message).toBe('Toast 6');
    });

    it('resetAll clears toasts', () => {
      const store = usePhotoboothStore.getState();
      store.addToast({ type: 'success', message: 'Test', duration: 3000 });
      expect(usePhotoboothStore.getState().toasts).toHaveLength(1);

      store.resetAll();
      expect(usePhotoboothStore.getState().toasts).toEqual([]);
    });
  });
});
