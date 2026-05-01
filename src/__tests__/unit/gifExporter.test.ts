import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LayoutConfig } from '../../types/layout';
import type { ThemeConfig } from '../../types/theme';
import type { Customization } from '../../types/customization';

let lastGif: any;

vi.mock('gif.js', () => {
  class MockGIF {
    frames: Array<{ frame: unknown; options: unknown }> = [];
    handlers: Record<string, Array<(arg: any) => void>> = {};

    constructor(_opts: unknown) {
      lastGif = this;
    }

    addFrame(frame: unknown, options: unknown) {
      this.frames.push({ frame, options });
    }

    on(event: string, cb: (arg: any) => void) {
      (this.handlers[event] ||= []).push(cb);
    }

    render() {
      this.emit('progress', 1);
      this.emit('finished', new Blob(['gif'], { type: 'image/gif' }));
    }

    private emit(event: string, payload: any) {
      (this.handlers[event] || []).forEach((cb) => cb(payload));
    }
  }

  return {
    __esModule: true,
    default: MockGIF,
    __getLastGif: () => lastGif,
  };
});

vi.mock('../../renderer/themeRenderer', () => ({
  drawThemeBackground: vi.fn(),
  drawThemeDecorations: vi.fn(),
}));

vi.mock('../../renderer/CanvasRenderer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../renderer/CanvasRenderer')>();
  return {
    ...actual,
    renderAtSize: vi.fn(async () => {}),
  };
});

import { exportAsGif } from '../../renderer/exporters/gifExporter';

const defaultCustomizations: Customization = {
  stickers: [],
  textOverlays: [],
  filter: null,
  adjustments: {
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
  },
  dateStamp: null,
  shape: {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  logo: null,
};

describe('exportAsGif', () => {
  const ctxStub: any = {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    strokeRect: vi.fn(),
    stroke: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxStub);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('produces (photoCount * 5) + 1 frames', async () => {
    const layout: LayoutConfig = {
      type: 'classic-strip',
      label: 'Test',
      photoCount: 4,
      positions: [],
      stripAspectRatio: 0.5,
    };

    const theme: ThemeConfig = {
      id: 'midnight-glimmer',
      label: 'Test',
      tag: 'Test',
      background: '#000000',
      accentColor: '#ff00ff',
      decorations: [],
    };

    await exportAsGif(layout, theme, [], defaultCustomizations);

    const gifJs = await import('gif.js');
    const instance = (gifJs as any).__getLastGif();

    expect(instance.frames).toHaveLength(layout.photoCount * 5 + 1);
  });
});
