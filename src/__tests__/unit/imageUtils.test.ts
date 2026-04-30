import { describe, it, expect } from 'vitest';
import {
  clampPosition,
  validateLogoFile,
} from '../../utils/imageUtils';

describe('clampPosition', () => {
  it('returns values unchanged when within 0-1 range', () => {
    expect(clampPosition(0.5, 0.5, 800, 600)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('clamps negative values to 0', () => {
    expect(clampPosition(-0.3, -1, 800, 600)).toEqual({ x: 0, y: 0 });
  });

  it('clamps values above 1 to 1', () => {
    expect(clampPosition(1.5, 2, 800, 600)).toEqual({ x: 1, y: 1 });
  });

  it('handles exact boundary values 0 and 1', () => {
    expect(clampPosition(0, 1, 800, 600)).toEqual({ x: 0, y: 1 });
    expect(clampPosition(1, 0, 800, 600)).toEqual({ x: 1, y: 0 });
  });
});

describe('validateLogoFile', () => {
  function makeFile(name: string, type: string, sizeBytes: number): File {
    const content = new Uint8Array(sizeBytes);
    return new File([content], name, { type });
  }

  it('accepts a valid PNG file', () => {
    const file = makeFile('logo.png', 'image/png', 1024);
    expect(validateLogoFile(file)).toEqual({ valid: true });
  });

  it('accepts a valid JPEG file', () => {
    const file = makeFile('logo.jpg', 'image/jpeg', 2048);
    expect(validateLogoFile(file)).toEqual({ valid: true });
  });

  it('accepts a valid SVG file', () => {
    const file = makeFile('logo.svg', 'image/svg+xml', 512);
    expect(validateLogoFile(file)).toEqual({ valid: true });
  });

  it('rejects an unsupported file type', () => {
    const file = makeFile('logo.bmp', 'image/bmp', 1024);
    const result = validateLogoFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('PNG, JPG, or SVG');
  });

  it('rejects a file larger than 5MB', () => {
    const file = makeFile('big.png', 'image/png', 6 * 1024 * 1024);
    const result = validateLogoFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('accepts a file exactly at 5MB', () => {
    const file = makeFile('exact.png', 'image/png', 5 * 1024 * 1024);
    expect(validateLogoFile(file)).toEqual({ valid: true });
  });
});
