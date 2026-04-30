import type { LayoutConfig } from '../types/layout';
import type { ThemeConfig } from '../types/theme';
import type { CapturedPhoto } from '../types/capture';
import type { Customization } from '../types/customization';
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

      // Draw border (outside clipping so it's visible)
      if (customizations.shape.borderWidth > 0) {
        ctx.save();
        ctx.strokeStyle = customizations.shape.borderColor;
        ctx.lineWidth = customizations.shape.borderWidth;

        if (customizations.shape.borderRadius > 0) {
          const radiusFraction = customizations.shape.borderRadius / 100;
          const radius =
            radiusFraction * Math.min(pos.width, pos.height) * 0.5;
          roundedRectPath(ctx, pos.x, pos.y, pos.width, pos.height, radius);
          ctx.stroke();
        } else {
          ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
        }

        ctx.restore();
      }
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

  // 6. Draw sticker overlays
  drawStickers(ctx, customizations.stickers, width, height);

  // 7. Draw text overlays
  drawTextOverlays(ctx, customizations.textOverlays, width, height);

  // 8. Draw logo
  drawLogo(ctx, customizations.logo, width, height);

  // 9. Draw date stamp
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
