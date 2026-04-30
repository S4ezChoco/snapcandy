import { useRef } from 'react';
import { useSparkles } from '../../hooks/useSparkles';

export default function SparkleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useSparkles({ canvasRef, particleCount: 40 });

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden="true"
    />
  );
}
