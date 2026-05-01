import { useMemo } from 'react';
import { calculateAlignment } from '../utils/alignmentUtils';
import type { AlignmentGuideState } from '../types/ui';

interface AlignmentGuideResult {
  guides: AlignmentGuideState;
  snappedX: number;
  snappedY: number;
}

/**
 * Hook that integrates alignment guide calculation with drag logic.
 *
 * Accepts the current drag position (normalized 0–1) or `null` when not
 * dragging. Returns alignment guide visibility and snapped coordinates,
 * or `null` when there is no active drag.
 *
 * @param dragPosition - Normalized {x, y} during drag, or null when idle
 * @returns Alignment guide state with snapped positions, or null
 */
export function useAlignmentGuides(
  dragPosition: { x: number; y: number } | null,
): AlignmentGuideResult | null {
  return useMemo(() => {
    if (!dragPosition) return null;

    const result = calculateAlignment(dragPosition.x, dragPosition.y);

    return {
      guides: {
        showHorizontalCenter: result.showHorizontalCenter,
        showVerticalCenter: result.showVerticalCenter,
      },
      snappedX: result.snappedX,
      snappedY: result.snappedY,
    };
  }, [dragPosition]);
}
