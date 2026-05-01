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
 * - exposure: 0 maps to 100%, -100 to 0%, +100 to 200%
 * - temperature: mapped to a small hue-rotate shift (-40deg..40deg)
 * - tint: mapped to a smaller hue-rotate shift (-20deg..20deg)
 * - blur: mapped from 0..100 to 0..8px
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

  // Apply adjustments (with defensive defaults for restored sessions)
  const brightness = adjustments.brightness ?? 0;
  const contrast = adjustments.contrast ?? 0;
  const saturation = adjustments.saturation ?? 0;
  const exposure = adjustments.exposure ?? 0;
  const temperature = adjustments.temperature ?? 0;
  const tint = adjustments.tint ?? 0;
  const blur = adjustments.blur ?? 0;

  // Map -100..100 to 0%..200%
  const brightnessPercent = 100 + brightness;
  const contrastPercent = 100 + contrast;
  const saturatePercent = 100 + saturation;
  const exposurePercent = 100 + exposure;

  if (exposure !== 0) {
    parts.push(`brightness(${exposurePercent}%)`);
  }

  if (brightness !== 0) {
    parts.push(`brightness(${brightnessPercent}%)`);
  }
  if (contrast !== 0) {
    parts.push(`contrast(${contrastPercent}%)`);
  }
  if (saturation !== 0) {
    parts.push(`saturate(${saturatePercent}%)`);
  }

  if (temperature !== 0) {
    // Approximation: temperature shift via hue rotate.
    const deg = Math.round(temperature * 0.4); // -40..40
    parts.push(`hue-rotate(${deg}deg)`);
  }

  if (tint !== 0) {
    // Approximation: tint shift via small hue rotate.
    const deg = Math.round(tint * 0.2); // -20..20
    parts.push(`hue-rotate(${deg}deg)`);
  }

  if (blur > 0) {
    const blurPx = (blur / 100) * 8;
    parts.push(`blur(${blurPx.toFixed(2)}px)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}
