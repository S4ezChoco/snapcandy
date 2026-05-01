/**
 * Alignment guide calculation utilities for drag operations.
 *
 * Provides pure functions to determine when center alignment guides
 * should be shown and to snap positions to the center axis when
 * within a configurable threshold.
 */

export interface AlignmentResult {
  showHorizontalCenter: boolean;
  showVerticalCenter: boolean;
  snappedX: number;
  snappedY: number;
}

const DEFAULT_THRESHOLD = 0.05;

/**
 * Calculate alignment guide visibility and snapped position.
 *
 * @param x - Normalized horizontal position in [0, 1]
 * @param y - Normalized vertical position in [0, 1]
 * @param threshold - Distance from center (0.5) at which guides appear and snapping occurs (default 0.05)
 * @returns Alignment result with guide visibility flags and snapped coordinates
 */
export function calculateAlignment(
  x: number,
  y: number,
  threshold: number = DEFAULT_THRESHOLD,
): AlignmentResult {
  const showHorizontalCenter = Math.abs(x - 0.5) <= threshold;
  const showVerticalCenter = Math.abs(y - 0.5) <= threshold;

  return {
    showHorizontalCenter,
    showVerticalCenter,
    snappedX: showHorizontalCenter ? 0.5 : x,
    snappedY: showVerticalCenter ? 0.5 : y,
  };
}
