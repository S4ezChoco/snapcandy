import type { LayoutConfig } from '../types/layout';
import type { ThemeConfig } from '../types/theme';
import type { CapturedPhoto } from '../types/capture';
import type { Customization, ImageAdjustments } from '../types/customization';
import { calculatePixelPositions } from './layoutRenderer';
import { drawThemeBackground, drawThemeDecorations } from './themeRenderer';
import { getFilterString } from './filterRenderer';
import {
  drawStickers,
  drawTextOverlays,
  drawLogo,
  drawDateStamp,
} from './overlayRenderer';

/**
 * Loads an image from a blob URL or data URL into an HTMLImageElement.
 * Returns a Promise that resolves with the loaded image.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (_e) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Applies post-processing pixel operations to the current canvas contents.
 * This is intended to run AFTER photos are drawn and BEFORE overlays.
 */
export function applyCanvasAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: ImageAdjustments
): void {
  const highlights = adjustments.highlights ?? 0;
  const shadows = adjustments.shadows ?? 0;
  const sharpness = adjustments.sharpness ?? 0;
  const vignette = adjustments.vignette ?? 0;
  const grain = adjustments.grain ?? 0;
  const fade = adjustments.fade ?? 0;

  if (
    highlights === 0 &&
    shadows === 0 &&
    sharpness === 0 &&
    vignette === 0 &&
    grain === 0 &&
    fade === 0
  ) {
    return;
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const highlightStrength = clamp01(Math.abs(highlights) / 100) * Math.sign(highlights);
  const shadowStrength = clamp01(Math.abs(shadows) / 100) * Math.sign(shadows);
  const fadeStrength = clamp01(fade / 100);

  // 1) Highlights/Shadows/Fade (in-place)
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (highlightStrength !== 0 || shadowStrength !== 0) {
      const lum =
        (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      if (highlightStrength !== 0 && lum > 0.5) {
        const t = clamp01((lum - 0.5) / 0.5);
        const amt = highlightStrength * t;
        if (amt > 0) {
          r = r + (255 - r) * amt;
          g = g + (255 - g) * amt;
          b = b + (255 - b) * amt;
        } else {
          const scale = 1 + amt;
          r = r * scale;
          g = g * scale;
          b = b * scale;
        }
      }

      if (shadowStrength !== 0 && lum < 0.5) {
        const t = clamp01((0.5 - lum) / 0.5);
        const amt = shadowStrength * t;
        if (amt > 0) {
          r = r + (255 - r) * amt;
          g = g + (255 - g) * amt;
          b = b + (255 - b) * amt;
        } else {
          const scale = 1 + amt;
          r = r * scale;
          g = g * scale;
          b = b * scale;
        }
      }
    }

    if (fadeStrength !== 0) {
      r = r * (1 - fadeStrength) + 255 * fadeStrength;
      g = g * (1 - fadeStrength) + 255 * fadeStrength;
      b = b * (1 - fadeStrength) + 255 * fadeStrength;
    }

    data[i] = clampByte(r);
    data[i + 1] = clampByte(g);
    data[i + 2] = clampByte(b);
  }

  // 2) Sharpness (unsharp via simple cross kernel)
  if (sharpness > 0) {
    const amount = clamp01(sharpness / 100) * 0.6;
    const src = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        const left = idx - 4;
        const right = idx + 4;
        const up = idx - width * 4;
        const down = idx + width * 4;

        for (let c = 0; c < 3; c++) {
          const center = src[idx + c];
          const sharpened =
            center * 5 -
            src[left + c] -
            src[right + c] -
            src[up + c] -
            src[down + c];
          const blended = center * (1 - amount) + sharpened * amount;
          data[idx + c] = clampByte(blended);
        }
      }
    }
  }

  // 3) Vignette (darken edges)
  if (vignette > 0) {
    const strength = clamp01(vignette / 100) * 0.75;
    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;

    for (let y = 0; y < height; y++) {
      const dy = (y - cy) / cy;
      for (let x = 0; x < width; x++) {
        const dx = (x - cx) / cx;
        const dist2 = clamp01((dx * dx + dy * dy) / 2);
        const v = 1 - strength * dist2 * dist2;

        const idx = (y * width + x) * 4;
        data[idx] = clampByte(data[idx] * v);
        data[idx + 1] = clampByte(data[idx + 1] * v);
        data[idx + 2] = clampByte(data[idx + 2] * v);
      }
    }
  }

  // 4) Grain (add noise)
  if (grain > 0) {
    const amp = clamp01(grain / 100) * 20;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() * 2 - 1) * amp;
      data[i] = clampByte(data[i] + n);
      data[i + 1] = clampByte(data[i + 1] + n);
      data[i + 2] = clampByte(data[i + 2] + n);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Calculates canvas dimensions for a given target width based on the layout's aspect ratio.
 */
function calculateCanvasDimensions(
  layout: LayoutConfig,
  targetWidth: number
): { width: number; height: number } {
  const width = targetWidth;
  const height = Math.round(targetWidth / layout.stripAspectRatio);
  return { width, height };
}

/**
 * Calculates canvas dimensions ensuring the longest side meets the minimum resolution.
 */
function calculateFullResolutionDimensions(
  layout: LayoutConfig,
  minResolution: number
): { width: number; height: number } {
  if (layout.stripAspectRatio >= 1) {
    // Width is the longest side
    const width = Math.max(minResolution, 1200);
    const height = Math.round(width / layout.stripAspectRatio);
    return { width, height };
  } else {
    // Height is the longest side
    const height = Math.max(minResolution, 1200);
    const width = Math.round(height * layout.stripAspectRatio);
    return { width, height };
  }
}

/**
 * Core rendering pipeline that draws the complete photo strip onto a canvas.
 */
async function renderToCanvas(
  canvas: HTMLCanvasElement,
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization,
  targetWidth: number,
  targetHeight: number
): Promise<void> {
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas 2D context');
  }

  const width = canvas.width;
  const height = canvas.height;

  // 1. Draw theme background
  drawThemeBackground(ctx, theme, width, height);

  // 2. Draw theme decorations
  drawThemeDecorations(ctx, theme, width, height);

  // 3. Calculate pixel positions for photos
  const positions = calculatePixelPositions(layout, width, height);

  // 4. Build the CSS filter string
  const filterString = getFilterString(
    customizations.filter,
    customizations.adjustments
  );

  // 5. Draw each photo at its calculated position
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const photo = photos[i];

    if (!photo) continue;

    try {
      const img = await loadImage(photo.blobUrl);

      ctx.save();

      // Apply shape clipping (border radius)
      if (customizations.shape.borderRadius > 0) {
        const radiusFraction = customizations.shape.borderRadius / 100;
        const radius =
          radiusFraction * Math.min(pos.width, pos.height) * 0.5;
        roundedRectPath(ctx, pos.x, pos.y, pos.width, pos.height, radius);
        ctx.clip();
      }

      // Apply filter
      if (filterString !== 'none') {
        ctx.filter = filterString;
      }

      // Draw the photo (cover behavior — maintain aspect ratio, crop excess)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const posAspect = pos.width / pos.height;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAspect > posAspect) {
        // Image is wider — crop sides
        sh = img.naturalHeight;
        sw = sh * posAspect;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        // Image is taller — crop top/bottom
        sw = img.naturalWidth;
        sh = sw / posAspect;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, pos.x, pos.y, pos.width, pos.height);

      // Reset filter
      ctx.filter = 'none';

      ctx.restore();
    } catch {
      // Draw placeholder for failed images
      ctx.save();
      ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '⚠ Image failed',
        pos.x + pos.width / 2,
        pos.y + pos.height / 2
      );
      ctx.restore();
    }
  }

  // 6. Post-process canvas adjustments (after photos, before overlays)
  applyCanvasAdjustments(ctx, width, height, customizations.adjustments);

  // 7. Draw borders (after adjustments so borders aren’t affected)
  if (customizations.shape.borderWidth > 0) {
    ctx.save();
    ctx.strokeStyle = customizations.shape.borderColor;
    ctx.lineWidth = customizations.shape.borderWidth;

    positions.forEach((pos) => {
      if (customizations.shape.borderRadius > 0) {
        const radiusFraction = customizations.shape.borderRadius / 100;
        const radius = radiusFraction * Math.min(pos.width, pos.height) * 0.5;
        roundedRectPath(ctx, pos.x, pos.y, pos.width, pos.height, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
      }
    });

    ctx.restore();
  }

  // 8. Draw sticker overlays
  drawStickers(ctx, customizations.stickers, width, height);

  // 9. Draw text overlays
  drawTextOverlays(ctx, customizations.textOverlays, width, height);

  // 10. Draw logo
  drawLogo(ctx, customizations.logo, width, height);

  // 11. Draw date stamp
  drawDateStamp(ctx, customizations.dateStamp, width, height);
}

/**
 * Creates a rounded rectangle path on the canvas context.
 */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Renders a preview of the photo strip at 400-600px width.
 */
export async function renderPreview(
  canvas: HTMLCanvasElement,
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization
): Promise<void> {
  const previewWidth = 500;
  const { width, height } = calculateCanvasDimensions(layout, previewWidth);
  await renderToCanvas(canvas, layout, theme, photos, customizations, width, height);
}

/**
 * Renders the strip at an explicit size.
 * Useful for exports that need a specific resolution.
 */
export async function renderAtSize(
  canvas: HTMLCanvasElement,
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization,
  width: number,
  height: number
): Promise<void> {
  await renderToCanvas(canvas, layout, theme, photos, customizations, width, height);
}

/**
 * Renders the photo strip at full resolution (minimum 1200px on longest side).
 */
export async function renderFull(
  canvas: HTMLCanvasElement,
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization,
  minResolution: number = 1200
): Promise<void> {
  const { width, height } = calculateFullResolutionDimensions(
    layout,
    minResolution
  );
  await renderToCanvas(canvas, layout, theme, photos, customizations, width, height);
}
