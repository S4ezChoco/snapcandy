import type { LayoutConfig } from './layout';
import type { ThemeConfig } from './theme';
import type { CaptureSettings } from './capture';
import type { Customization } from './customization';

/** Toast notification */
export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

/** Confirmation dialog config */
export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'default';
  onConfirm: () => void;
}

/** Session persistence data (serializable subset of store) */
export interface SerializedSession {
  version: number;
  timestamp: number;
  currentStep: number;
  selectedLayout: LayoutConfig | null;
  selectedTheme: ThemeConfig | null;
  captureSettings: CaptureSettings;
  customizations: Customization;
  hadPhotos: boolean;
  photoCount: number;
}

/** Alignment guide state */
export interface AlignmentGuideState {
  showHorizontalCenter: boolean;
  showVerticalCenter: boolean;
}

/** History state for undo/redo */
export interface HistoryState {
  undoStack: Customization[];
  redoStack: Customization[];
}
