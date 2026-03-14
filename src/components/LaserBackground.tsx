import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowRadius: number;
  phase: number;      // twinkle phase offset
  speed: number;      // twinkle speed
  minAlpha: number;   // dimmest state
}

const COLORS = [
  '#ff3366', '#ff0066', '#ff4488',  // pinks/reds
  '#6633ff', '#8855ff', '#aa66ff',  // purples
  '#3388ff', '#00aaff', '#00ccff',  // blues
  '#00ffaa', '#00ff88', '#33ffcc',  // greens/teals
  '#ffaa00', '#ff8800',             // ambers
  '#ffffff', '#eeeeff', '#ccddff',  // whites/cool whites
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateStars(count: number): Star[] {
  const rand = seededRandom(42);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const colorIdx = Math.floor(rand() * COLORS.length);
    const isBright = rand() < 0.15;
    const radius = isBright ? 1.2 + rand() * 1.3 : 0.5 + rand() * 0.8;
    stars.push({
      x: rand(),
      y: rand(),
      radius,
      color: COLORS[colorIdx],
      glowRadius: radius * (isBright ? 8 : 4),
      phase: rand() * Math.PI * 2,
      speed: 0.3 + rand() * 1.2,
      minAlpha: isBright ? 0.4 : 0.15,
    });
  }
  return stars;
}

const STAR_COUNT = 350;
const STARS = generateStars(STAR_COUNT);

const LaserBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let needsResize = true;

    const resize = () => {
      needsResize = true;
    };

    const applyResize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      needsResize = false;
    };

    const draw = (time: number) => {
      if (needsResize) applyResize();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Dark background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(1, '#030308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const t = time / 1000;

      ctx.globalCompositeOperation = 'screen';

      for (const star of STARS) {
        const sx = star.x * w;
        const sy = star.y * h;

        // Twinkle: smooth sine wave oscillation
        const twinkle = Math.sin(t * star.speed + star.phase);
        const alpha = star.minAlpha + (1 - star.minAlpha) * (0.5 + 0.5 * twinkle);

        // Outer glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.glowRadius);
        glow.addColorStop(0, star.color + hexAlpha(alpha * 0.5));
        glow.addColorStop(0.4, star.color + hexAlpha(alpha * 0.15));
        glow.addColorStop(1, star.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, star.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = star.color + hexAlpha(alpha);
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';

      animRef.current = requestAnimationFrame(draw);
    };

    applyResize();
    animRef.current = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);

    // Re-size continuously as the header transitions between heights
    const observer = new ResizeObserver(() => resize());
    observer.observe(parent);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
};

function hexAlpha(a: number): string {
  const clamped = Math.max(0, Math.min(1, a));
  const hex = Math.round(clamped * 255).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export default LaserBackground;
