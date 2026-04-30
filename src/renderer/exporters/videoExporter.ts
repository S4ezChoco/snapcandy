import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { CapturedPhoto } from '../../types/capture';
import type { Customization } from '../../types/customization';
import { renderFull, loadImage } from '../CanvasRenderer';

/**
 * Records a video that shows each captured photo as a slideshow,
 * then ends with the complete strip. Uses MediaRecorder API.
 */
export async function exportAsVideo(
  layout: LayoutConfig,
  theme: ThemeConfig,
  photos: CapturedPhoto[],
  customizations: Customization,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const videoResolution = 800;

  // Render the full strip to get canvas dimensions
  const stripCanvas = document.createElement('canvas');
  await renderFull(stripCanvas, layout, theme, photos, customizations, videoResolution);

  const vidWidth = stripCanvas.width;
  const vidHeight = stripCanvas.height;

  // Create the animation canvas
  const canvas = document.createElement('canvas');
  canvas.width = vidWidth;
  canvas.height = vidHeight;
  const ctx = canvas.getContext('2d')!;

  const fps = 30;
  const secondsPerPhoto = 2;
  const secondsForStrip = 3;
  const photoFrames = photos.length * secondsPerPhoto * fps;
  const stripFrames = secondsForStrip * fps;
  const totalFrames = photoFrames + stripFrames;
  const frameDuration = 1000 / fps;

  // Pre-load all images
  const images: HTMLImageElement[] = [];
  for (const photo of photos) {
    try {
      images.push(await loadImage(photo.blobUrl));
    } catch {
      // Skip failed images
    }
  }

  // Set up MediaRecorder
  const stream = canvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      onProgress?.(100);
      resolve(blob);
    };

    recorder.onerror = () => {
      reject(new Error('Video recording failed'));
    };

    recorder.start();

    let frameIndex = 0;

    const drawFrame = () => {
      if (frameIndex >= totalFrames) {
        recorder.stop();
        return;
      }

      if (frameIndex < photoFrames) {
        // Slideshow phase: show individual photos
        const photoIndex = Math.floor(frameIndex / (secondsPerPhoto * fps)) % images.length;
        const img = images[photoIndex];

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, vidWidth, vidHeight);

        if (img) {
          const padding = Math.round(vidWidth * 0.06);
          const areaW = vidWidth - padding * 2;
          const areaH = vidHeight - padding * 2;

          const imgAspect = img.naturalWidth / img.naturalHeight;
          const areaAspect = areaW / areaH;

          let drawW: number, drawH: number;
          if (imgAspect > areaAspect) {
            drawW = areaW;
            drawH = areaW / imgAspect;
          } else {
            drawH = areaH;
            drawW = areaH * imgAspect;
          }

          const drawX = (vidWidth - drawW) / 2;
          const drawY = (vidHeight - drawH) / 2;

          ctx.save();
          // Rounded clip
          const r = 8;
          ctx.beginPath();
          ctx.moveTo(drawX + r, drawY);
          ctx.lineTo(drawX + drawW - r, drawY);
          ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + r);
          ctx.lineTo(drawX + drawW, drawY + drawH - r);
          ctx.quadraticCurveTo(drawX + drawW, drawY + drawH, drawX + drawW - r, drawY + drawH);
          ctx.lineTo(drawX + r, drawY + drawH);
          ctx.quadraticCurveTo(drawX, drawY + drawH, drawX, drawY + drawH - r);
          ctx.lineTo(drawX, drawY + r);
          ctx.quadraticCurveTo(drawX, drawY, drawX + r, drawY);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Photo counter
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = `${Math.round(vidWidth * 0.03)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`${photoIndex + 1} / ${photos.length}`, vidWidth / 2, vidHeight - padding / 2);
        }
      } else {
        // Strip phase: show the final rendered strip
        ctx.clearRect(0, 0, vidWidth, vidHeight);
        ctx.drawImage(stripCanvas, 0, 0);
      }

      frameIndex++;
      onProgress?.(Math.round((frameIndex / totalFrames) * 95));

      setTimeout(drawFrame, frameDuration);
    };

    drawFrame();
  });
}
