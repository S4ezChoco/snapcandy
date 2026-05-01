import { useRef, useEffect, useCallback, useState } from 'react';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';
import { renderPreview } from '../../renderer/CanvasRenderer';
import { useAlignmentGuides } from '../../hooks/useAlignmentGuides';
import SkeletonLoader from '../shared/SkeletonLoader';
import type { Customization } from '../../types/customization';

type DragTarget = { type: 'sticker'; id: string } | { type: 'text'; id: string } | { type: 'logo' } | null;

interface SelectedSticker {
  id: string;
  toolbarX: number;
  toolbarY: number;
}

const SCALE_STEP = 0.1;
const ROTATE_STEP = 15;
const CLICK_THRESHOLD = 3; // px — movement below this is treated as a click, not a drag

export default function StripPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const renderIdRef = useRef(0);

  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [isRendered, setIsRendered] = useState(false);
  // Local drag position — only committed to store on mouseUp
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  // Reactive drag position for alignment guides and tooltip
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  // Mouse client position for tooltip placement
  const [mouseClient, setMouseClient] = useState<{ x: number; y: number } | null>(null);

  // Click vs drag detection
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  // Floating toolbar for selected sticker
  const [selectedSticker, setSelectedSticker] = useState<SelectedSticker | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const alignment = useAlignmentGuides(dragPosition);

  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const customizations = usePhotoboothStore((s) => s.customizations);
  const updateCustomizations = usePhotoboothStore((s) => s.updateCustomizations);
  const previewFilter = usePhotoboothStore((s) => s.previewFilter);

  // Build customizations with drag position applied locally (not in store)
  const getLocalCustomizations = useCallback((): Customization => {
    if (!dragTarget || !dragPosRef.current) return customizations;
    // Use snapped positions from alignment guides when available
    const raw = dragPosRef.current;
    const pos = alignment
      ? { x: alignment.snappedX, y: alignment.snappedY }
      : raw;

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
  }, [dragTarget, customizations, alignment]);

  // Render to offscreen canvas, then blit to visible canvas (no flicker)
  const doRender = useCallback(async (localCustom?: Customization) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayout || !selectedTheme) return;

    const id = ++renderIdRef.current;
    let customs = localCustom ?? customizations;

    // Apply preview filter override when hovering a filter option
    if (!localCustom && previewFilter !== undefined) {
      customs = { ...customs, filter: previewFilter };
    }

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

      // Mark first render complete
      if (!isRendered) {
        setIsRendered(true);
      }
    } catch {
      // ignore render errors
    }
  }, [selectedLayout, selectedTheme, capturedPhotos, customizations, previewFilter, canvasSize, isRendered]);

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

    // Track mouse-down position for click vs drag detection
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;

    const hitR = 0.05;

    // Check logo
    if (customizations.logo) {
      const l = customizations.logo;
      if (pos.x >= l.x - 0.02 && pos.x <= l.x + l.width + 0.02 && pos.y >= l.y - 0.02 && pos.y <= l.y + l.height + 0.02) {
        setDragTarget({ type: 'logo' });
        dragPosRef.current = pos;
        setDragPosition(pos);
        setMouseClient({ x: e.clientX, y: e.clientY });
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
        setDragPosition(pos);
        setMouseClient({ x: e.clientX, y: e.clientY });
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
        setDragPosition(pos);
        setMouseClient({ x: e.clientX, y: e.clientY });
        e.preventDefault();
        return;
      }
    }

    // Clicked on empty canvas area — deselect sticker
    setSelectedSticker(null);
  }, [customizations, getPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragTarget) return;
    const pos = getPos(e);
    if (!pos) return;

    // Detect if mouse moved enough to count as a drag
    if (mouseDownPosRef.current) {
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) >= CLICK_THRESHOLD) {
        didDragRef.current = true;
      }
    }

    dragPosRef.current = pos;
    setDragPosition(pos);
    setMouseClient({ x: e.clientX, y: e.clientY });

    // Render locally with drag position (no store update = no flicker)
    const localCustom = getLocalCustomizations();
    doRender(localCustom);
  }, [dragTarget, getPos, getLocalCustomizations, doRender]);

  const handleMouseUp = useCallback(() => {
    if (!dragTarget || !dragPosRef.current) {
      setDragTarget(null);
      setDragPosition(null);
      setMouseClient(null);
      mouseDownPosRef.current = null;
      return;
    }

    // If this was a click (not a drag) on a sticker, show the floating toolbar
    if (!didDragRef.current && dragTarget.type === 'sticker') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const sticker = customizations.stickers.find((s) => s.id === dragTarget.id);
        if (sticker) {
          // Position toolbar near the sticker on the canvas
          const toolbarX = rect.left + sticker.x * rect.width;
          const toolbarY = rect.top + sticker.y * rect.height - 44; // above the sticker
          setSelectedSticker({
            id: sticker.id,
            toolbarX,
            toolbarY,
          });
        }
      }
      // Don't commit position — it didn't move
      setDragTarget(null);
      dragPosRef.current = null;
      setDragPosition(null);
      setMouseClient(null);
      mouseDownPosRef.current = null;
      return;
    }

    // Commit final position to store (use snapped positions if available)
    const raw = dragPosRef.current;
    const pos = alignment
      ? { x: alignment.snappedX, y: alignment.snappedY }
      : raw;
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

    // Deselect sticker toolbar on drag
    setSelectedSticker(null);

    setDragTarget(null);
    dragPosRef.current = null;
    setDragPosition(null);
    setMouseClient(null);
    mouseDownPosRef.current = null;
  }, [dragTarget, customizations, updateCustomizations, alignment]);

  // Sticker toolbar actions
  const handleDeleteSticker = useCallback(() => {
    if (!selectedSticker) return;
    updateCustomizations({
      stickers: customizations.stickers.filter((s) => s.id !== selectedSticker.id),
    });
    setSelectedSticker(null);
  }, [selectedSticker, customizations, updateCustomizations]);

  const handleScaleSticker = useCallback((direction: 'up' | 'down') => {
    if (!selectedSticker) return;
    updateCustomizations({
      stickers: customizations.stickers.map((s) =>
        s.id === selectedSticker.id
          ? { ...s, scale: Math.max(0.2, Math.min(3, s.scale + (direction === 'up' ? SCALE_STEP : -SCALE_STEP))) }
          : s
      ),
    });
  }, [selectedSticker, customizations, updateCustomizations]);

  const handleRotateSticker = useCallback(() => {
    if (!selectedSticker) return;
    updateCustomizations({
      stickers: customizations.stickers.map((s) =>
        s.id === selectedSticker.id
          ? { ...s, rotation: (s.rotation + ROTATE_STEP) % 360 }
          : s
      ),
    });
  }, [selectedSticker, customizations, updateCustomizations]);

  // Close toolbar when clicking outside
  useEffect(() => {
    if (!selectedSticker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setSelectedSticker(null);
      }
    };
    // Use a timeout so the current click event doesn't immediately close the toolbar
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedSticker]);

  // Deselect sticker if it was removed from the store
  useEffect(() => {
    if (selectedSticker && !customizations.stickers.some((s) => s.id === selectedSticker.id)) {
      setSelectedSticker(null);
    }
  }, [customizations.stickers, selectedSticker]);

  const displayW = canvasSize ? Math.round(canvasSize.w * zoom) : undefined;
  const displayH = canvasSize ? Math.round(canvasSize.h * zoom) : undefined;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          aria-label="Zoom out"
          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm cursor-pointer"
        >
          −
        </button>
        <span className="text-[0.625rem] text-white/60 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
          aria-label="Zoom in"
          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center text-sm cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Canvas — scrollable container */}
      <div className="flex-1 overflow-auto w-full flex items-start justify-center p-4" data-testid="strip-preview">
        {!isRendered && (
          <SkeletonLoader
            width={displayW ?? 300}
            height={displayH ?? 500}
            borderRadius="0.75rem"
            className="rounded-xl"
          />
        )}
        <div className="relative inline-block" style={displayW && displayH ? { width: displayW, height: displayH } : undefined}>
          <canvas
            ref={canvasRef}
            className={`rounded-xl shadow-xl block ${dragTarget ? 'cursor-grabbing' : 'cursor-grab'} ${!isRendered ? 'hidden' : ''}`}
            style={displayW && displayH ? { width: displayW, height: displayH, minWidth: displayW, minHeight: displayH } : undefined}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Alignment guides — only visible during drag */}
          {dragTarget && alignment && isRendered && (
            <>
              {alignment.guides.showVerticalCenter && (
                <div
                  data-testid="guide-vertical"
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: '50%',
                    width: '1px',
                    borderLeft: '1px dashed rgba(244, 162, 97, 0.7)',
                    transform: 'translateX(-0.5px)',
                  }}
                />
              )}
              {alignment.guides.showHorizontalCenter && (
                <div
                  data-testid="guide-horizontal"
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top: '50%',
                    height: '1px',
                    borderTop: '1px dashed rgba(244, 162, 97, 0.7)',
                    transform: 'translateY(-0.5px)',
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Position tooltip — shown near cursor during drag */}
        {dragTarget && dragPosition && mouseClient && (
          <div
            data-testid="position-tooltip"
            className="fixed pointer-events-none z-50 px-2 py-1 rounded bg-black/80 text-white text-[0.625rem] tabular-nums whitespace-nowrap"
            style={{
              left: mouseClient.x + 14,
              top: mouseClient.y - 28,
            }}
          >
            {Math.round((alignment ? alignment.snappedX : dragPosition.x) * 100)}%, {Math.round((alignment ? alignment.snappedY : dragPosition.y) * 100)}%
          </div>
        )}

        {/* Floating toolbar for selected sticker */}
        {selectedSticker && (
          <div
            ref={toolbarRef}
            data-testid="sticker-toolbar"
            className="fixed z-50 flex items-center gap-1 px-2 py-1 rounded-xl bg-black/80 border border-white/10 shadow-lg"
            style={{
              left: selectedSticker.toolbarX,
              top: selectedSticker.toolbarY,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              type="button"
              onClick={handleDeleteSticker}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-red-500/30 text-white/70 hover:text-red-300 transition-colors duration-150 cursor-pointer"
              aria-label="Delete sticker"
              title="Delete"
            >
              🗑
            </button>
            <button
              type="button"
              onClick={() => handleScaleSticker('down')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
              aria-label="Scale down sticker"
              title="Scale down"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => handleScaleSticker('up')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
              aria-label="Scale up sticker"
              title="Scale up"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleRotateSticker}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
              aria-label="Rotate sticker"
              title="Rotate"
            >
              ↻
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
