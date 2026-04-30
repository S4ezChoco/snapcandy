/**
 * Image utility helpers for loading, resizing, position clamping,
 * and logo file validation.
 */

const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Loads an image from a blob URL or data URL into an HTMLImageElement.
 * Resolves once the image has fully loaded.
 */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Resizes an image to fit within the given max dimensions while
 * maintaining its original aspect ratio. Returns a canvas with
 * the resized image drawn onto it.
 */
export function resizeImage(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
): HTMLCanvasElement {
  const { naturalWidth, naturalHeight } = img;

  // Determine the scale factor that fits the image within bounds
  const scale = Math.min(
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
    1, // never upscale
  );

  const width = Math.round(naturalWidth * scale);
  const height = Math.round(naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }

  return canvas;
}

/**
 * Clamps a normalized position (0-1) so that it stays within
 * the canvas bounds. Values below 0 are clamped to 0 and values
 * above 1 are clamped to 1.
 */
export function clampPosition(
  x: number,
  y: number,
  _canvasWidth: number,
  _canvasHeight: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
}

/**
 * Validates a logo file for acceptable type (PNG, JPG, SVG) and
 * size (max 5 MB).
 */
export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PNG, JPG, or SVG file.' };
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { valid: false, error: 'Logo file is too large. Please use an image under 5MB.' };
  }

  return { valid: true };
}
