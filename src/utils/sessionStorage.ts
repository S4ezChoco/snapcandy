import type { SerializedSession } from '../types/ui';
import type { PhotoboothStore } from '../store/usePhotoboothStore';

/** Current session schema version */
export const SESSION_VERSION = 1;

/** localStorage key for session data */
export const STORAGE_KEY = 'snapcandy-session';

/**
 * Extracts serializable fields from the store state, stripping non-serializable
 * photo data (blobUrl, imageData) and setting the hadPhotos flag.
 */
export function serializeSession(
  state: Pick<
    PhotoboothStore,
    | 'currentStep'
    | 'selectedLayout'
    | 'selectedTheme'
    | 'captureSettings'
    | 'customizations'
    | 'capturedPhotos'
  >
): string {
  const session: SerializedSession = {
    version: SESSION_VERSION,
    timestamp: Date.now(),
    currentStep: state.currentStep,
    selectedLayout: state.selectedLayout,
    selectedTheme: state.selectedTheme,
    captureSettings: state.captureSettings,
    customizations: state.customizations,
    hadPhotos: state.capturedPhotos.length > 0,
    photoCount: state.capturedPhotos.length,
  };

  return JSON.stringify(session);
}

/**
 * Parses a JSON string and validates it as a SerializedSession.
 * Returns the typed session or null. Never throws.
 */
export function deserializeSession(json: string): SerializedSession | null {
  try {
    const data: unknown = JSON.parse(json);
    if (isValidSession(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Type guard that validates the shape of restored data, including the version field.
 */
export function isValidSession(data: unknown): data is SerializedSession {
  if (data === null || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // version must match current
  if (obj.version !== SESSION_VERSION) {
    return false;
  }

  // timestamp
  if (typeof obj.timestamp !== 'number') {
    return false;
  }

  // currentStep
  if (typeof obj.currentStep !== 'number') {
    return false;
  }

  // selectedLayout: null or object with required fields
  if (obj.selectedLayout !== null) {
    if (typeof obj.selectedLayout !== 'object') {
      return false;
    }
    const layout = obj.selectedLayout as Record<string, unknown>;
    if (
      typeof layout.type !== 'string' ||
      typeof layout.label !== 'string' ||
      typeof layout.photoCount !== 'number' ||
      !Array.isArray(layout.positions) ||
      typeof layout.stripAspectRatio !== 'number'
    ) {
      return false;
    }
  }

  // selectedTheme: null or object with required fields
  if (obj.selectedTheme !== null) {
    if (typeof obj.selectedTheme !== 'object') {
      return false;
    }
    const theme = obj.selectedTheme as Record<string, unknown>;
    if (
      typeof theme.id !== 'string' ||
      typeof theme.label !== 'string' ||
      typeof theme.tag !== 'string' ||
      typeof theme.background !== 'string' ||
      typeof theme.accentColor !== 'string' ||
      !Array.isArray(theme.decorations)
    ) {
      return false;
    }
  }

  // captureSettings
  if (typeof obj.captureSettings !== 'object' || obj.captureSettings === null) {
    return false;
  }
  const cs = obj.captureSettings as Record<string, unknown>;
  if (
    typeof cs.mode !== 'string' ||
    typeof cs.timerSeconds !== 'number' ||
    typeof cs.mirrored !== 'boolean' ||
    typeof cs.fullscreen !== 'boolean' ||
    typeof cs.quality !== 'string'
  ) {
    return false;
  }

  // customizations
  if (typeof obj.customizations !== 'object' || obj.customizations === null) {
    return false;
  }
  const cust = obj.customizations as Record<string, unknown>;
  if (
    !Array.isArray(cust.stickers) ||
    !Array.isArray(cust.textOverlays) ||
    typeof cust.adjustments !== 'object' ||
    cust.adjustments === null ||
    typeof cust.shape !== 'object' ||
    cust.shape === null
  ) {
    return false;
  }

  // hadPhotos and photoCount
  if (typeof obj.hadPhotos !== 'boolean') {
    return false;
  }
  if (typeof obj.photoCount !== 'number') {
    return false;
  }

  return true;
}
