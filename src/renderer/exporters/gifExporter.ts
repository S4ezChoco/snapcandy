import GIF from 'gif.js';
import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { CapturedPhoto } from '../../types/capture';
import type { Customization } from '../../types/customization';
import { applyCanvasAdjustments, loadImage, renderAtSize } from '../CanvasRenderer';
import { drawThemeBackground, drawThemeDecorations } from '../themeRenderer';
import { getFilterString } from '../filterRenderer';

type CountdownNumber = 1 | 2 | 3;

function createFrameCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas 2D context');
  }
  return { canvas, ctx };
}

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

function drawCountdownFrame(
  ctx: CanvasRenderingContext2D,
  theme: ThemeConfig,
  width: number,
  height: number,
  number: CountdownNumber
): void {
  drawThemeBackground(ctx, theme, width, height);
  drawThemeDecorations(ctx, theme, width, height);

  const fontSize = Math.round(Math.min(width, height) * 0.55);
  ctx.save();
  ctx.fillStyle = theme.accentColor;
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), width / 2, height / 2);
  ctx.restore();
}

function drawFlashFrame(
  ctx: CanvasRenderingContext2D,
  theme: ThemeConfig,
  width: number,
  height: number
): void {
  drawThemeBackground(ctx, theme, width, height);
  drawThemeDecorations(ctx, theme, width, height);

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

type RevealRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

function drawRevealFrame(
  ctx: CanvasRenderingContext2D,
  theme: ThemeConfig,
  width: number,
  height: number,
  img: HTMLImageElement | null,
  customizations: Customization,
  filterString: string
): RevealRect {
  drawThemeBackground(ctx, theme, width, height);
  drawThemeDecorations(ctx, theme, width, height);

  const maxW = width * 0.84;
  const maxH = height * 0.84;

  let drawW = maxW;
  let drawH = maxH;
  if (img) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = maxW / maxH;
    if (imgAspect > boxAspect) {
      drawW = maxW;
      drawH = drawW / imgAspect;
    } else {
      drawH = maxH;
      drawW = drawH * imgAspect;
    }
  }

  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  const radiusFraction = customizations.shape.borderRadius / 100;
  const radius = radiusFraction * Math.min(drawW, drawH) * 0.5;

  ctx.save();
  if (customizations.shape.borderRadius > 0) {
    roundedRectPath(ctx, x, y, drawW, drawH, radius);
    ctx.clip();
  }

  if (img) {
    if (filterString !== 'none') {
      ctx.filter = filterString;
    }
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, drawW, drawH);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.25)';
    ctx.fillRect(x, y, drawW, drawH);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No photo', x + drawW / 2, y + drawH / 2);
  }

  ctx.restore();

  return { x, y, width: drawW, height: drawH, radius };
}

function drawRevealBorder(
  ctx: CanvasRenderingContext2D,
  rect: RevealRect,
  customizations: Customization
): void {
  if (customizations.shape.borderWidth <= 0) return;

  ctx.save();
  ctx.strokeStyle = customizations.shape.borderColor;
  ctx.lineWidth = customizations.shape.borderWidth;

  if (customizations.shape.borderRadius > 0) {
    roundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, rect.radius);
    ctx.stroke();
  } else {
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  ctx.restore();
}

/**
 * Creates an animated GIF that replays the capture flow:
 * countdown (3-2-1), flash, reveal photo — repeated per photo,
 * followed by a final strip frame rendered via the normal pipeline.
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

  const countdownDelay = 400;
  const flashDelay = 120;
  const revealDelay = 450;
  const finalDelay = 1200;

  // Pre-load images (keep indexing aligned with photo slots)
  const images: Array<HTMLImageElement | null> = [];
  for (let i = 0; i < layout.photoCount; i++) {
    const photo = photos[i];
    if (!photo) {
      images.push(null);
      continue;
    }
    try {
      images.push(await loadImage(photo.blobUrl));
    } catch {
      images.push(null);
    }
  }

  const filterString = getFilterString(
    customizations.filter,
    customizations.adjustments
  );

  const totalFrames = layout.photoCount * 5 + 1;
  let generatedFrames = 0;
  const reportFrameProgress = () => {
    if (!onProgress) return;
    const p = Math.round((generatedFrames / totalFrames) * 70);
    onProgress(Math.max(0, Math.min(70, p)));
  };

  const addFrame = (canvas: HTMLCanvasElement, delay: number) => {
    gif.addFrame(canvas, { delay, copy: true });
    generatedFrames++;
    reportFrameProgress();
  };

  for (let i = 0; i < layout.photoCount; i++) {
    // 3-2-1 countdown
    for (const n of [3, 2, 1] as const) {
      const { canvas, ctx } = createFrameCanvas(gifWidth, gifHeight);
      drawCountdownFrame(ctx, theme, gifWidth, gifHeight, n);
      addFrame(canvas, countdownDelay);
    }

    // Flash frame
    {
      const { canvas, ctx } = createFrameCanvas(gifWidth, gifHeight);
      drawFlashFrame(ctx, theme, gifWidth, gifHeight);
      addFrame(canvas, flashDelay);
    }

    // Reveal frame
    {
      const { canvas, ctx } = createFrameCanvas(gifWidth, gifHeight);
      const rect = drawRevealFrame(
        ctx,
        theme,
        gifWidth,
        gifHeight,
        images[i],
        customizations,
        filterString
      );

      // Apply pixel-level adjustments on the reveal (but keep borders crisp)
      applyCanvasAdjustments(ctx, gifWidth, gifHeight, customizations.adjustments);
      drawRevealBorder(ctx, rect, customizations);

      addFrame(canvas, revealDelay);
    }
  }

  // Final strip frame via the existing render pipeline
  {
    const { canvas } = createFrameCanvas(gifWidth, gifHeight);
    await renderAtSize(canvas, layout, theme, photos, customizations, gifWidth, gifHeight);
    addFrame(canvas, finalDelay);
  }

  // Ensure we end frame generation at 70%
  onProgress?.(70);

  return new Promise<Blob>((resolve, reject) => {
    gif.on('progress', (p: number) => {
      onProgress?.(70 + Math.round(p * 30));
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
