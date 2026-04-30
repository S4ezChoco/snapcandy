import type { LayoutConfig } from '../types/layout';

export interface PixelPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts normalized layout positions (0-1) to actual pixel coordinates
 * based on the target canvas dimensions.
 */
export function calculatePixelPositions(
  layout: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): PixelPosition[] {
  return layout.positions.map((pos) => ({
    x: pos.x * canvasWidth,
    y: pos.y * canvasHeight,
    width: pos.width * canvasWidth,
    height: pos.height * canvasHeight,
  }));
}
