import GIF from 'gif.js';
import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { CapturedPhoto } from '../../types/capture';
import type { Customization } from '../../types/customization';
import { loadImage } from '../CanvasRenderer';
import { calculatePixelPositions } from '../layoutRenderer';
import { drawThemeBackground, drawThemeDecorations } from '../themeRenderer';
import { getFilterString } from '../filterRenderer';

/**
 * Creates an animated GIF of the photo strip where all photos
 * have a subtle Ken Burns (zoom/pan) animation simultaneously,
 * making the strip feel alive and dynamic.
 * 
 * The animation runs for ~3 seconds total with all photos moving at once.
 */
export async function exportAsGif(
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const gifResolution = 600;

  // Calculate canvas dimensions
  const aspectRatio = layout.stripAspectRatio;
  let gifWidth: number;
  let gifHeight: number;
  if (aspectRatio >= 1) {
    gifWidth = gifResolution;
    gifHeight = Math.round(gifResolution / aspectRatio);
  } else {
    gifHeight = gifResolution;
    gifWidth = Math.round(gifHeight * aspectRatio);
  }

  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: '/gif.worker.js',
    width: gifWidth,
    height: gifHeight,
  });

  // Pre-load all images
  const images: HTMLImageElement[] = [];
  for (const photo of photos) {
    try {
      images.push(await loadImage(photo.blobUrl));
    } catch {
      // skip failed
    }
  }

  const positions = calculatePixelPositions(layout, gifWidth, gifHeight);
  const filterString = getFilterString(customizations.filter, customizations.adjustments);

  // Generate 30 frames over ~3 seconds (100ms per frame)
  const totalFrames = 30;
  const frameDelay = 100; // ms

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames; // 0 to 1 progress

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = gifWidth;
    frameCanvas.height = gifHeight;
    const ctx = frameCanvas.getContext('2d')!;

    // Draw theme background
    drawThemeBackground(ctx, theme, gifWidth, gifHeight);
    drawThemeDecorations(ctx, theme, gifWidth, gifHeight);

    // Draw each photo with a subtle zoom animation
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const img = images[i];
      if (!img) continue;

      // Each photo gets a slightly different animation phase
      const phase = t + (i * 0.15);
      // Subtle zoom: oscillate between 1.0 and 1.08
      const zoom = 1.0 + 0.08 * Math.sin(phase * Math.PI * 2);
      // Subtle pan
      const panX = Math.sin(phase * Math.PI * 2 + i) * 0.02;
      const panY = Math.cos(phase * Math.PI * 2 + i * 0.7) * 0.02;

      ctx.save();

      // Clip to position
      ctx.beginPath();
      if (customizations.shape.borderRadius > 0) {
        const radiusFraction = customizations.shape.borderRadius / 100;
        const radius = radiusFraction * Math.min(pos.width, pos.height) * 0.5;
        const r = Math.min(radius, pos.width / 2, pos.height / 2);
        ctx.moveTo(pos.x + r, pos.y);
        ctx.lineTo(pos.x + pos.width - r, pos.y);
        ctx.quadraticCurveTo(pos.x + pos.width, pos.y, pos.x + pos.width, pos.y + r);
        ctx.lineTo(pos.x + pos.width, pos.y + pos.height - r);
        ctx.quadraticCurveTo(pos.x + pos.width, pos.y + pos.height, pos.x + pos.width - r, pos.y + pos.height);
        ctx.lineTo(pos.x + r, pos.y + pos.height);
        ctx.quadraticCurveTo(pos.x, pos.y + pos.height, pos.x, pos.y + pos.height - r);
        ctx.lineTo(pos.x, pos.y + r);
        ctx.quadraticCurveTo(pos.x, pos.y, pos.x + r, pos.y);
      } else {
        ctx.rect(pos.x, pos.y, pos.width, pos.height);
      }
      ctx.closePath();
      ctx.clip();

      // Apply filter
      if (filterString !== 'none') {
        ctx.filter = filterString;
      }

      // Calculate source crop (cover behavior) with zoom/pan
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const posAspect = pos.width / pos.height;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAspect > posAspect) {
        sh = img.naturalHeight / zoom;
        sw = sh * posAspect;
        sx = (img.naturalWidth - sw) / 2 + panX * img.naturalWidth;
        sy = (img.naturalHeight - sh) / 2 + panY * img.naturalHeight;
      } else {
        sw = img.naturalWidth / zoom;
        sh = sw / posAspect;
        sx = (img.naturalWidth - sw) / 2 + panX * img.naturalWidth;
        sy = (img.naturalHeight - sh) / 2 + panY * img.naturalHeight;
      }

      // Clamp source coordinates
      sx = Math.max(0, Math.min(img.naturalWidth - sw, sx));
      sy = Math.max(0, Math.min(img.naturalHeight - sh, sy));

      ctx.drawImage(img, sx, sy, sw, sh, pos.x, pos.y, pos.width, pos.height);
      ctx.filter = 'none';
      ctx.restore();

      // Draw border
      if (customizations.shape.borderWidth > 0) {
        ctx.save();
        ctx.strokeStyle = customizations.shape.borderColor;
        ctx.lineWidth = customizations.shape.borderWidth;
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
        ctx.restore();
      }
    }

    gif.addFrame(frameCanvas, { delay: frameDelay, copy: true });
    onProgress?.(Math.round(((frame + 1) / totalFrames) * 50));
  }

  return new Promise<Blob>((resolve, reject) => {
    gif.on('progress', (p: number) => {
      onProgress?.(50 + Math.round(p * 50));
    });

    gif.on('finished', (blob: Blob) => {
      onProgress?.(100);
      resolve(blob);
    });

    gif.on('abort', () => {
      reject(new Error('GIF encoding was aborted'));
    });

    gif.render();
  });
}
