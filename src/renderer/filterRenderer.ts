import type { FilterType, ImageAdjustments } from '../types/customization';

/**
 * Generates a CSS filter string from a filter type and image adjustments.
 *
 * Filter mappings:
 * - grayscale: grayscale(100%)
 * - sepia: sepia(100%)
 * - vintage: sepia(50%) contrast(120%) brightness(90%)
 * - warm: hue-rotate(15deg) saturate(150%)
 * - cool: hue-rotate(180deg) brightness(105%)
 *
 * Adjustments are mapped from -100..100 range to CSS filter percentages:
 * - brightness: 0 maps to 100%, -100 to 0%, +100 to 200%
 * - contrast: 0 maps to 100%, -100 to 0%, +100 to 200%
 * - saturation: 0 maps to 100%, -100 to 0%, +100 to 200%
 */
export function getFilterString(
  filter: FilterType | null,
  adjustments: ImageAdjustments
): string {
  const parts: string[] = [];

  // Apply named filter
  switch (filter) {
    case 'grayscale':
      parts.push('grayscale(100%)');
      break;
    case 'sepia':
      parts.push('sepia(100%)');
      break;
    case 'vintage':
      parts.push('sepia(50%)', 'contrast(120%)', 'brightness(90%)');
      break;
    case 'warm':
      parts.push('hue-rotate(15deg)', 'saturate(150%)');
      break;
    case 'cool':
      parts.push('hue-rotate(180deg)', 'brightness(105%)');
      break;
    case 'none':
    case null:
      // No filter applied
      break;
  }

  // Apply adjustments: map -100..100 to 0%..200%
  const brightnessPercent = 100 + adjustments.brightness;
  const contrastPercent = 100 + adjustments.contrast;
  const saturatePercent = 100 + adjustments.saturation;

  if (adjustments.brightness !== 0) {
    parts.push(`brightness(${brightnessPercent}%)`);
  }
  if (adjustments.contrast !== 0) {
    parts.push(`contrast(${contrastPercent}%)`);
  }
  if (adjustments.saturation !== 0) {
    parts.push(`saturate(${saturatePercent}%)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}
