import { useRef } from 'react';
import { useCursorTrail } from '../../hooks/useCursorTrail';

export default function CursorTrailOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCursorTrail({ canvasRef, trailLength: 18 });

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 51 }}
      aria-hidden="true"
    />
  );
}
