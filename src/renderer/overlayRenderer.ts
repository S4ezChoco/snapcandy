import type {
  StickerPlacement,
  TextOverlay,
  LogoPlacement,
  DateStampConfig,
} from '../types/customization';

/**
 * Draws sticker emojis at specified positions with scale and rotation.
 * Sticker positions are normalized (0-1) relative to canvas dimensions.
 */
export function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: StickerPlacement[],
  canvasWidth: number,
  canvasHeight: number
): void {
  for (const sticker of stickers) {
    const x = sticker.x * canvasWidth;
    const y = sticker.y * canvasHeight;
    const fontSize = 32 * sticker.scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.stickerId, 0, 0);
    ctx.restore();
  }
}

/**
 * Draws text overlays at specified positions with font, size, color, and rotation.
 * Text positions are normalized (0-1) relative to canvas dimensions.
 */
export function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  textOverlays: TextOverlay[],
  canvasWidth: number,
  canvasHeight: number
): void {
  for (const overlay of textOverlays) {
    // Skip empty text
    if (!overlay.text.trim()) continue;

    const x = overlay.x * canvasWidth;
    const y = overlay.y * canvasHeight;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
    ctx.fillStyle = overlay.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(overlay.text, 0, 0);
    ctx.restore();
  }
}

/**
 * Draws a logo image at the specified position and size.
 * Logo position and dimensions are normalized (0-1) relative to canvas dimensions.
 * Maintains the logo's natural aspect ratio within the specified bounds.
 */
export function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: LogoPlacement | null,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!logo) return;

  const img = new Image();
  img.src = logo.imageDataUrl;

  // If the image is already loaded (cached data URL), draw immediately
  if (img.complete && img.naturalWidth > 0) {
    const targetX = logo.x * canvasWidth;
    const targetY = logo.y * canvasHeight;
    const targetW = logo.width * canvasWidth;
    const targetH = logo.height * canvasHeight;

    // Maintain aspect ratio (fit within bounds)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const targetAspect = targetW / targetH;

    let drawW: number, drawH: number;
    if (imgAspect > targetAspect) {
      drawW = targetW;
      drawH = targetW / imgAspect;
    } else {
      drawH = targetH;
      drawW = targetH * imgAspect;
    }

    const drawX = targetX + (targetW - drawW) / 2;
    const drawY = targetY + (targetH - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}

/**
 * Draws a date stamp text at the specified position.
 * Date stamp position is normalized (0-1) relative to canvas dimensions.
 */
export function drawDateStamp(
  ctx: CanvasRenderingContext2D,
  dateStamp: DateStampConfig | null,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!dateStamp) return;

  const x = dateStamp.x * canvasWidth;
  const y = dateStamp.y * canvasHeight;

  ctx.save();
  ctx.font = `${dateStamp.fontSize}px sans-serif`;
  ctx.fillStyle = dateStamp.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateStamp.format, x, y);
  ctx.restore();
}
