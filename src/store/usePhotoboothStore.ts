import { create } from 'zustand';
import type { LayoutConfig } from '../types/layout';
import type { ThemeConfig } from '../types/theme';
import type { CapturedPhoto, CaptureSettings } from '../types/capture';
import type { Customization, FilterType } from '../types/customization';
import type { ToastItem } from '../types/ui';

const MAX_VISIBLE_TOASTS = 5;

let toastCounter = 0;

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
  toasts: ToastItem[];
  previewFilter: FilterType | null | undefined; // undefined = no preview active, null/'none' = preview "no filter", FilterType = preview that filter

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
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
  setPreviewFilter: (filter: FilterType | null | undefined) => void;
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
  toasts: [],
  previewFilter: undefined,

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
      customizations: {
        ...state.customizations,
        ...updates,
        adjustments: updates.adjustments
          ? { ...state.customizations.adjustments, ...updates.adjustments }
          : state.customizations.adjustments,
        shape: updates.shape
          ? { ...state.customizations.shape, ...updates.shape }
          : state.customizations.shape,
      },
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
      toasts: [],
      previewFilter: undefined,
    }),

  goToStep: (step) => set({ currentStep: step }),

  addToast: (toast) =>
    set((state) => {
      const newToast: ToastItem = {
        ...toast,
        id: `toast-${++toastCounter}`,
        createdAt: Date.now(),
      };
      const updated = [...state.toasts, newToast];
      // Cap at MAX_VISIBLE_TOASTS by removing oldest first
      if (updated.length > MAX_VISIBLE_TOASTS) {
        return { toasts: updated.slice(updated.length - MAX_VISIBLE_TOASTS) };
      }
      return { toasts: updated };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setPreviewFilter: (filter) => set({ previewFilter: filter }),
}));
