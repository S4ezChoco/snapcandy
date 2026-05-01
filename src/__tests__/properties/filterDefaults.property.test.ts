import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getFilterString } from '../../renderer/filterRenderer';
import type { FilterType, ImageAdjustments } from '../../types/customization';

const defaultAdjustments: ImageAdjustments = {
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

/**
 * Property-based tests for filter string defaults.
 *
 * **Validates: Requirement 5.7**
 */
describe('Filter Defaults Properties', () => {
  it('returns "none" when filter is null/"none" and all adjustments are default (0)', () => {
    fc.assert(
      fc.property(fc.constantFrom<FilterType | null>(null, 'none'), (filter) => {
        expect(getFilterString(filter, defaultAdjustments)).toBe('none');
      })
    );
  });
});
