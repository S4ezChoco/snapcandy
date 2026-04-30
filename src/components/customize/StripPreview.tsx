import { useRef, useEffect, useCallback, useState } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import { renderPreview } from '../../renderer/CanvasRenderer';
import type { Customization } from '../../types/customization';

type DragTarget = { type: 'sticker'; id: string } | { type: 'text'; id: string } | { type: 'logo' } | null;

export default function StripPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const renderIdRef = useRef(0);

  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  // Local drag position — only committed to store on mouseUp
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);

  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);

  // Build customizations with drag position applied locally (not in store)
  const getLocalCustomizations = useCallback((): Customization => {
    if (!dragTarget || !dragPosRef.current) return customizations;
    const pos = dragPosRef.current;

    if (dragTarget.type === 'sticker') {
      return {
        ...customizations,
        stickers: customizations.stickers.map((s) =>
          s.id === dragTarget.id ? { ...s, x: pos.x, y: pos.y } : s
        ),
      };
    } else if (dragTarget.type === 'text') {
      return {
        ...customizations,
        textOverlays: customizations.textOverlays.map((t) =>
          t.id === dragTarget.id ? { ...t, x: pos.x, y: pos.y } : t
        ),
      };
    } else if (dragTarget.type === 'logo' && customizations.logo) {
      return {
        ...customizations,
        logo: {
          ...customizations.logo,
          x: Math.max(0, Math.min(1 - customizations.logo.width, pos.x - customizations.logo.width / 2)),
          y: Math.max(0, Math.min(1 - customizations.logo.height, pos.y - customizations.logo.height / 2)),
        },
      };
    }
    return customizations;
  }, [dragTarget, customizations]);

  // Render to offscreen canvas, then blit to visible canvas (no flicker)
  const doRender = useCallback(async (localCustom?: Customization) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayout || !selectedTheme) return;

    const id = ++renderIdRef.current;
    const customs = localCustom ?? customizations;

    // Create offscreen canvas if needed
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenRef.current;

    try {
      await renderPreview(offscreen, selectedLayout, selectedTheme, capturedPhotos, customs);

      // Check if this render is still current (not stale)
      if (id !== renderIdRef.current) return;

      // Blit offscreen to visible canvas in one operation
      canvas.width = offscreen.width;
      canvas.height = offscreen.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(offscreen, 0, 0);
      }

      // Calculate display size once
      if (!canvasSize && canvas.width > 0 && canvas.height > 0) {
        const maxH = window.innerHeight - 180;
        const maxW = Math.min(window.innerWidth - 360, 550);
        const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
        setCanvasSize({
          w: Math.round(canvas.width * scale),
          h: Math.round(canvas.height * scale),
        });
      }
    } catch {
      // ignore render errors
    }
  }, [selectedLayout, selectedTheme, capturedPhotos, customizations, canvasSize]);

  // Re-render when store changes (but NOT during drag — drag uses local state)
  useEffect(() => {
    if (!dragTarget) {
      doRender();
    }
  }, [doRender, dragTarget]);

  // Get normalized position from mouse event
  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e);
    if (!pos) return;

    const hitR = 0.05;

    // Check logo
    if (customizations.logo) {
      const l = customizations.logo;
      if (pos.x >= l.x - 0.02 && pos.x <= l.x + l.width + 0.02 && pos.y >= l.y - 0.02 && pos.y <= l.y + l.height + 0.02) {
        setDragTarget({ type: 'logo' });
        dragPosRef.current = pos;
        e.preventDefault();
        return;
      }
    }

    // Check text
    for (let i = customizations.textOverlays.length - 1; i >= 0; i--) {
      const t = customizations.textOverlays[i];
      if (Math.abs(pos.x - t.x) < hitR * 2 && Math.abs(pos.y - t.y) < hitR) {
        setDragTarget({ type: 'text', id: t.id });
        dragPosRef.current = pos;
        e.preventDefault();
        return;
      }
    }

    // Check stickers
    for (let i = customizations.stickers.length - 1; i >= 0; i--) {
      const s = customizations.stickers[i];
      if (Math.abs(pos.x - s.x) < hitR && Math.abs(pos.y - s.y) < hitR) {
        setDragTarget({ type: 'sticker', id: s.id });
        dragPosRef.current = pos;
        e.preventDefault();
        return;
      }
    }
  }, [customizations, getPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragTarget) return;
    const pos = getPos(e);
    if (!pos) return;

    dragPosRef.current = pos;

    // Render locally with drag position (no store update = no flicker)
    const localCustom = getLocalCustomizations();
    doRender(localCustom);
  }, [dragTarget, getPos, getLocalCustomizations, doRender]);

  const handleMouseUp = useCallback(() => {
    if (!dragTarget || !dragPosRef.current) {
      setDragTarget(null);
      return;
    }

    // Commit final position to store
    const pos = dragPosRef.current;
    if (dragTarget.type === 'sticker') {
      updateCustomizations({
        stickers: customizations.stickers.map((s) =>
          s.id === dragTarget.id ? { ...s, x: pos.x, y: pos.y } : s
        ),
      });
    } else if (dragTarget.type === 'text') {
      updateCustomizations({
        textOverlays: customizations.textOverlays.map((t) =>
          t.id === dragTarget.id ? { ...t, x: pos.x, y: pos.y } : t
        ),
      });
    } else if (dragTarget.type === 'logo' && customizations.logo) {
      updateCustomizations({
        logo: {
          ...customizations.logo,
          x: Math.max(0, Math.min(1 - customizations.logo.width, pos.x - customizations.logo.width / 2)),
          y: Math.max(0, Math.min(1 - customizations.logo.height, pos.y - customizations.logo.height / 2)),
        },
      });
    }

    setDragTarget(null);
    dragPosRef.current = null;
  }, [dragTarget, customizations, updateCustomizations]);

  const displayW = canvasSize ? Math.round(canvasSize.w * zoom) : undefined;
  const displayH = canvasSize ? Math.round(canvasSize.h * zoom) : undefined;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm cursor-pointer"
        >
          −
        </button>
        <span className="text-[10px] text-white/40 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Canvas — scrollable container */}
      <div className="flex-1 overflow-auto w-full flex items-start justify-center p-4" data-testid="strip-preview">
        <canvas
          ref={canvasRef}
          className={`rounded-lg shadow-2xl shadow-black/40 block ${dragTarget ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={displayW && displayH ? { width: displayW, height: displayH, minWidth: displayW, minHeight: displayH } : undefined}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
