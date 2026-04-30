import { create } from 'zustand';
import type { LayoutConfig } from '../types/layout';
import type { ThemeConfig } from '../types/theme';
import type { CapturedPhoto, CaptureSettings } from '../types/capture';
import type { Customization } from '../types/customization';

export interface PhotoboothStore {
  // State
  currentStep: number;
  selectedLayout: LayoutConfig | null;
  selectedTheme: ThemeConfig | null;
  capturedPhotos: CapturedPhoto[];
  captureSettings: CaptureSettings;
  customizations: Customization;
  retakeIndex: number | null;
  isExporting: boolean;
  exportProgress: number;

  // Actions
  setLayout: (layout: LayoutConfig) => void;
  setTheme: (theme: ThemeConfig) => void;
  addPhoto: (photo: CapturedPhoto) => void;
  replacePhoto: (index: number, photo: CapturedPhoto) => void;
  clearPhotos: () => void;
  setCaptureSettings: (settings: Partial<CaptureSettings>) => void;
  updateCustomizations: (updates: Partial<Customization>) => void;
  resetAll: () => void;
  goToStep: (step: number) => void;
}

const defaultCaptureSettings: CaptureSettings = {
  mode: 'manual',
  timerSeconds: 3,
  mirrored: true,
  fullscreen: false,
  quality: 'balanced',
};

const defaultCustomizations: Customization = {
  stickers: [],
  textOverlays: [],
  filter: null,
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
  },
  dateStamp: null,
  shape: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  logo: null,
};

export const usePhotoboothStore = create<PhotoboothStore>((set) => ({
  // State
  currentStep: 0,
  selectedLayout: null,
  selectedTheme: null,
  capturedPhotos: [],
  captureSettings: { ...defaultCaptureSettings },
  customizations: { ...defaultCustomizations },
  retakeIndex: null,
  isExporting: false,
  exportProgress: 0,

  // Actions
  setLayout: (layout) => set({ selectedLayout: layout }),

  setTheme: (theme) => set({ selectedTheme: theme }),

  addPhoto: (photo) =>
    set((state) => ({
      capturedPhotos: [...state.capturedPhotos, photo],
    })),

  replacePhoto: (index, photo) =>
    set((state) => ({
      capturedPhotos: state.capturedPhotos.map((p, i) =>
        i === index ? photo : p
      ),
      retakeIndex: null,
    })),

  clearPhotos: () => set({ capturedPhotos: [], retakeIndex: null }),

  setCaptureSettings: (settings) =>
    set((state) => ({
      captureSettings: { ...state.captureSettings, ...settings },
    })),

  updateCustomizations: (updates) =>
    set((state) => ({
      customizations: { ...state.customizations, ...updates },
    })),

  resetAll: () =>
    set({
      currentStep: 0,
      selectedLayout: null,
      selectedTheme: null,
      capturedPhotos: [],
      captureSettings: { ...defaultCaptureSettings },
      customizations: { ...defaultCustomizations },
      retakeIndex: null,
      isExporting: false,
      exportProgress: 0,
    }),

  goToStep: (step) => set({ currentStep: step }),
}));
