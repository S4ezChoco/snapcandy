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
      expect(customizations.adjustments).toEqual({ brightness: 0, contrast: 0, saturation: 0 });
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
});
