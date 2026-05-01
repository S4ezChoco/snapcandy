import { describe, it, expect } from 'vitest';
import { getFilterString } from '../../renderer/filterRenderer';
import type { ImageAdjustments } from '../../types/customization';

const zeroAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  vignette: 0,
  grain: 0,
  blur: 0,
  fade: 0,
};

describe('getFilterString', () => {
  it('returns "none" when no filter and no adjustments', () => {
    expect(getFilterString(null, zeroAdjustments)).toBe('none');
    expect(getFilterString('none', zeroAdjustments)).toBe('none');
  });

  it('returns grayscale filter string', () => {
    expect(getFilterString('grayscale', zeroAdjustments)).toBe('grayscale(100%)');
  });

  it('returns sepia filter string', () => {
    expect(getFilterString('sepia', zeroAdjustments)).toBe('sepia(100%)');
  });

  it('returns vintage filter string with sepia, contrast, and brightness', () => {
    const result = getFilterString('vintage', zeroAdjustments);
    expect(result).toContain('sepia(50%)');
    expect(result).toContain('contrast(120%)');
    expect(result).toContain('brightness(90%)');
  });

  it('returns warm filter string with hue-rotate and saturate', () => {
    const result = getFilterString('warm', zeroAdjustments);
    expect(result).toContain('hue-rotate(15deg)');
    expect(result).toContain('saturate(150%)');
  });

  it('returns cool filter string with hue-rotate and brightness', () => {
    const result = getFilterString('cool', zeroAdjustments);
    expect(result).toContain('hue-rotate(180deg)');
    expect(result).toContain('brightness(105%)');
  });

  it('applies brightness adjustment', () => {
    const adj: ImageAdjustments = { ...zeroAdjustments, brightness: 50 };
    expect(getFilterString(null, adj)).toBe('brightness(150%)');
  });

  it('applies contrast adjustment', () => {
    const adj: ImageAdjustments = { ...zeroAdjustments, contrast: -30 };
    expect(getFilterString(null, adj)).toBe('contrast(70%)');
  });

  it('applies saturation adjustment', () => {
    const adj: ImageAdjustments = { ...zeroAdjustments, saturation: 100 };
    expect(getFilterString(null, adj)).toBe('saturate(200%)');
  });

  it('combines filter with adjustments', () => {
    const adj: ImageAdjustments = { ...zeroAdjustments, brightness: 20 };
    const result = getFilterString('grayscale', adj);
    expect(result).toContain('grayscale(100%)');
    expect(result).toContain('brightness(120%)');
  });
});
