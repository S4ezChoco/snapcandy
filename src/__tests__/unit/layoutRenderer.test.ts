import { describe, it, expect } from 'vitest';
import { calculatePixelPositions } from '../../renderer/layoutRenderer';
import { LAYOUT_PRESETS } from '../../config/layouts';

describe('calculatePixelPositions', () => {
  it('returns correct number of positions for each layout', () => {
    for (const layout of Object.values(LAYOUT_PRESETS)) {
      const positions = calculatePixelPositions(layout, 600, 1800);
      expect(positions).toHaveLength(layout.photoCount);
    }
  });

  it('multiplies normalized positions by canvas dimensions', () => {
    const layout = LAYOUT_PRESETS['classic-strip'];
    const canvasWidth = 400;
    const canvasHeight = 1200;

    const positions = calculatePixelPositions(layout, canvasWidth, canvasHeight);

    positions.forEach((pos, i) => {
      const norm = layout.positions[i];
      expect(pos.x).toBeCloseTo(norm.x * canvasWidth);
      expect(pos.y).toBeCloseTo(norm.y * canvasHeight);
      expect(pos.width).toBeCloseTo(norm.width * canvasWidth);
      expect(pos.height).toBeCloseTo(norm.height * canvasHeight);
    });
  });

  it('handles zero canvas dimensions', () => {
    const layout = LAYOUT_PRESETS['polaroid'];
    const positions = calculatePixelPositions(layout, 0, 0);

    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('handles large canvas dimensions', () => {
    const layout = LAYOUT_PRESETS['2x2-grid'];
    const positions = calculatePixelPositions(layout, 4000, 4000);

    expect(positions).toHaveLength(4);
    // First position: x=0.03*4000=120, y=0.03*4000=120, w=0.45*4000=1800, h=0.45*4000=1800
    expect(positions[0].x).toBeCloseTo(120);
    expect(positions[0].y).toBeCloseTo(120);
    expect(positions[0].width).toBeCloseTo(1800);
    expect(positions[0].height).toBeCloseTo(1800);
  });
});
