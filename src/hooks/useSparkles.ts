import { useEffect, useRef, useCallback, type RefObject } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  type: 'star' | 'dot';
  color: string;
  fadeDirection: 1 | -1;
  life: number;
  maxLife: number;
}

interface UseSparklesOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  particleCount?: number;
  enabled?: boolean;
}

const COLORS = ['#f4a261', '#ffffff', '#5eead4'];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createParticle(width: number, height: number): Particle {
  const maxLife = 200 + Math.random() * 300;
  return {
    x: Math.random() * width,
    y: height + Math.random() * 40,
    size: 2 + Math.random() * 5,
    opacity: 0,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: -(0.3 + Math.random() * 0.6),
    type: Math.random() > 0.4 ? 'star' : 'dot',
    color: randomColor(),
    fadeDirection: 1,
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

  // 4-pointed star
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

export function useSparkles({
  canvasRef,
  particleCount = 40,
  enabled = true,
}: UseSparklesOptions) {
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;

    // Spawn particles up to the target count
    while (particles.length < particleCount) {
      particles.push(createParticle(width, height));
    }

    // Update and draw each particle
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.life += 1;

      // Fade in during first 20% of life, fade out during last 30%
      const lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.2) {
        p.opacity = (lifeRatio / 0.2) * 0.8;
      } else if (lifeRatio > 0.7) {
        p.opacity = ((1 - lifeRatio) / 0.3) * 0.8;
      }

      // Remove dead or off-screen particles
      if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
        particles.splice(i, 1);
        continue;
      }

      if (p.type === 'star') {
        drawStar(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
      } else {
        drawDot(ctx, p.x, p.y, p.size, p.color, p.opacity);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [canvasRef, particleCount]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    particlesRef.current = [];
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      particlesRef.current = [];
    };
  }, [enabled, canvasRef, animate]);
}
