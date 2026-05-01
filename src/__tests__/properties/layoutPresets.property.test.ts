import { describe, it, expect } from 'vitest';
import { LAYOUT_LIST } from '../../config/layouts';

/**
 * Property-based tests for layout presets.
 * These verify structural invariants across ALL layout presets.
 *
 * **Validates: Requirements 1.4, 1.5**
 */
describe('Layout Presets Properties', () => {
  describe.each(LAYOUT_LIST.map((l) => [l.type, l] as const))(
    'layout "%s"',
    (_type, layout) => {
      /**
       * Property 2: Layout PhotoCount Consistency
       * FOR ALL layout presets, positions.length SHALL equal photoCount.
       *
       * **Validates: Requirements 1.5**
       */
      it('has positions.length === photoCount', () => {
        expect(layout.positions).toHaveLength(layout.photoCount);
      });

      /**
       * Property 1: Layout Position Bounds Invariant
       * FOR ALL layout presets, every position SHALL have
       * x >= 0, y >= 0, x + width <= 1, y + height <= 1.
       *
       * **Validates: Requirements 1.4**
       */
      it('has all positions within normalized bounds (0-1)', () => {
        layout.positions.forEach((pos, index) => {
          expect(pos.x, `position[${index}].x should be >= 0`).toBeGreaterThanOrEqual(0);
          expect(pos.y, `position[${index}].y should be >= 0`).toBeGreaterThanOrEqual(0);
          expect(
            pos.x + pos.width,
            `position[${index}] x+width should be <= 1`
          ).toBeLessThanOrEqual(1);
          expect(
            pos.y + pos.height,
            `position[${index}] y+height should be <= 1`
          ).toBeLessThanOrEqual(1);
        });
      });
    }
  );

  it('has at least 12 total layout presets', () => {
    expect(LAYOUT_LIST.length).toBeGreaterThanOrEqual(12);
  });
});
