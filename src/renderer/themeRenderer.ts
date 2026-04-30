import type { ThemeConfig } from '../types/theme';

interface GradientStop {
  color: string;
  position: number;
}

interface ParsedGradient {
  angle: number;
  stops: GradientStop[];
}

/**
 * Parses a CSS linear-gradient string into angle and color stops.
 * Supports format: linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%)
 */
function parseLinearGradient(css: string): ParsedGradient | null {
  const match = css.match(/linear-gradient\(([^)]+)\)/);
  if (!match) return null;

  const parts = match[1].split(',').map((s) => s.trim());
  if (parts.length < 2) return null;

  // Parse angle
  const angleMatch = parts[0].match(/([\d.]+)deg/);
  const angle = angleMatch ? parseFloat(angleMatch[1]) : 180;

  // Parse color stops
  const stops: GradientStop[] = [];
  for (let i = 1; i < parts.length; i++) {
    const stopMatch = parts[i].match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+([\d.]+)%/);
    if (stopMatch) {
      stops.push({
        color: stopMatch[1],
        position: parseFloat(stopMatch[2]) / 100,
      });
    }
  }

  return stops.length >= 2 ? { angle, stops } : null;
}

/**
 * Converts a CSS angle (in degrees) to canvas gradient start/end points.
 * CSS angles: 0deg = bottom-to-top, 90deg = left-to-right, 135deg = top-left to bottom-right
 */
function angleToGradientCoords(
  angleDeg: number,
  width: number,
  height: number
): { x0: number; y0: number; x1: number; y1: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Calculate the gradient line length to cover the entire rectangle
  const halfDiag = (Math.abs(width * cos) + Math.abs(height * sin)) / 2;
  const cx = width / 2;
  const cy = height / 2;

  return {
    x0: cx - cos * halfDiag,
    y0: cy - sin * halfDiag,
    x1: cx + cos * halfDiag,
    y1: cy + sin * halfDiag,
  };
}

/**
 * Draws the theme's gradient background onto the canvas context.
 */
export function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeConfig,
  width: number,
  height: number
): void {
  const parsed = parseLinearGradient(theme.background);

  if (parsed) {
    const coords = angleToGradientCoords(parsed.angle, width, height);
    const gradient = ctx.createLinearGradient(
      coords.x0,
      coords.y0,
      coords.x1,
      coords.y1
    );
    for (const stop of parsed.stops) {
      gradient.addColorStop(stop.position, stop.color);
    }
    ctx.fillStyle = gradient;
  } else {
    // Fallback: treat as solid color or use the raw string
    ctx.fillStyle = theme.background.startsWith('#')
      ? theme.background
      : '#0a1628';
  }

  ctx.fillRect(0, 0, width, height);
}

/**
 * Draws a 4-pointed star shape at the given center position.
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  opacity: number
): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();

  const outerRadius = size;
  const innerRadius = size * 0.4;
  const points = 4;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a petal (ellipse) shape at the given center position.
 */
function drawPetal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  opacity: number
): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.6, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a sparkle (small dot) at the given center position.
 */
function drawSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  opacity: number
): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws all theme decoration elements (stars, petals, sparkles) onto the canvas.
 */
export function drawThemeDecorations(
  ctx: CanvasRenderingContext2D,
  theme: ThemeConfig,
  width: number,
  height: number
): void {
  const color = theme.accentColor;

  for (const decoration of theme.decorations) {
    const cx = decoration.position.x * width;
    const cy = decoration.position.y * height;

    switch (decoration.type) {
      case 'star':
        drawStar(ctx, cx, cy, decoration.size, color, decoration.opacity);
        break;
      case 'petal':
        drawPetal(ctx, cx, cy, decoration.size, color, decoration.opacity);
        break;
      case 'sparkle':
        drawSparkle(ctx, cx, cy, decoration.size, color, decoration.opacity);
        break;
      // 'border-pattern' can be extended later
    }
  }
}
