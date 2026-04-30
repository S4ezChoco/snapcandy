import { useRef, useEffect, useState } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import { renderFull } from '../../renderer/CanvasRenderer';
import ExportActions from './ExportActions';

export default function ExportScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [displayStyle, setDisplayStyle] = useState<{ width: number; height: number }>({ width: 300, height: 400 });

  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const customizations = usePhotoboothStore((s) => s.customizations);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = previewRef.current;
    if (!canvas || !wrapper || !selectedLayout || !selectedTheme) return;

    renderFull(canvas, selectedLayout, selectedTheme, capturedPhotos, customizations)
      .then(() => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const maxW = wrapperRect.width - 32;
        const maxH = wrapperRect.height - 16;

        const canvasW = canvas.width;
        const canvasH = canvas.height;

        if (canvasW === 0 || canvasH === 0) return;

        const scale = Math.min(maxW / canvasW, maxH / canvasH, 1);
        setDisplayStyle({
          width: Math.round(canvasW * scale),
          height: Math.round(canvasH * scale),
        });
      })
      .catch((err) => console.warn('Export preview render failed:', err));
  }, [selectedLayout, selectedTheme, capturedPhotos, customizations]);

  return (
    <div
      data-testid="export-screen"
      className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto animate-fade-slide-in"
    >
      {/* Header */}
      <div className="text-center px-6 pt-4 pb-2 shrink-0">
        <p className="text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-2">
          Step 6 of 6
        </p>
        <h1
          className="text-3xl font-heading text-white mb-1"
          data-testid="export-heading"
        >
          Your strip is ready!
        </h1>
        <p className="text-sm text-white/60">
          Save, share, or start all over with a new look.
        </p>
      </div>

      {/* Main content: preview + actions */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-center lg:items-start gap-6 px-6 py-4">
        {/* Strip preview */}
        <div
          ref={previewRef}
          className="flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden"
          data-testid="final-preview"
        >
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl shadow-black/40"
            style={{
              width: displayStyle.width,
              height: displayStyle.height,
            }}
          />
        </div>

        {/* Action buttons panel */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col items-center">
          <ExportActions />
        </div>
      </div>
    </div>
  );
}
