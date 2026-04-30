import { useEffect, useRef, useCallback, type RefObject } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'star' | 'dot';
  color: string;
  life: number;
  maxLife: number;
}

interface UseCursorTrailOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  trailLength?: number;
  enabled?: boolean;
}

const COLORS = ['#f4a261', '#ffffff', '#5eead4'];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createTrailParticle(x: number, y: number): TrailParticle {
  const maxLife = 30 + Math.random() * 25;
  return {
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    size: 1.5 + Math.random() * 3.5,
    opacity: 0.7 + Math.random() * 0.3,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.08,
    type: Math.random() > 0.5 ? 'star' : 'dot',
    color: randomColor(),
    life: 0,
    maxLife,
  };
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  ctx.beginPath();
  const outerRadius = size;
  const innerRadius = size * 0.35;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const nextAngle = ((i + 0.5) * Math.PI) / 2;
    ctx.lineTo(
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * outerRadius
    );
    ctx.lineTo(
      Math.cos(nextAngle) * innerRadius,
      Math.sin(nextAngle) * innerRadius
    );
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function useCursorTrail({
  canvasRef,
  trailLength = 18,
  enabled = true,
}: UseCursorTrailOptions) {
  const particlesRef = useRef<TrailParticle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const spawnAccumulatorRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Spawn new particles at cursor position when mouse is active
    if (mouse.active) {
      spawnAccumulatorRef.current += 1;
      // Spawn 1-2 particles per frame to keep the trail dense
      if (spawnAccumulatorRef.current >= 2) {
        spawnAccumulatorRef.current = 0;
        const spawnCount = 1 + Math.floor(Math.random() * 2);
        for (let s = 0; s < spawnCount; s++) {
          if (particles.length < trailLength) {
            particles.push(createTrailParticle(mouse.x, mouse.y));
          }
        }
      }
    }

    // Update and draw each particle
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.rotation += p.rotationSpeed;
      p.life += 1;

      const lifeRatio = p.life / p.maxLife;

      // Shrink and fade as particle ages
      const scale = 1 - lifeRatio;
      const currentSize = p.size * scale;
      const currentOpacity = p.opacity * scale;

      // Remove dead particles
      if (p.life >= p.maxLife || currentOpacity < 0.01) {
        particles.splice(i, 1);
        continue;
      }

      if (p.type === 'star') {
        drawStar(ctx, p.x, p.y, currentSize, p.rotation, p.color, currentOpacity);
      } else {
        drawDot(ctx, p.x, p.y, currentSize, p.color, currentOpacity);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [canvasRef, trailLength]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    particlesRef.current = [];
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameRef.current);
      particlesRef.current = [];
    };
  }, [enabled, canvasRef, animate]);
}
