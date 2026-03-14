import React, { useRef, useEffect, useCallback } from 'react';

interface Beam {
  angle: number;
  color: string;
  glowColor: string;
  width: number;
}

// Laser beams spanning from -88 to +88 degrees to fill the entire header
const BEAMS: Beam[] = [
  { angle: -88, color: '#ff0044', glowColor: 'rgba(255,0,68,0.25)', width: 1.5 },
  { angle: -82, color: '#00ff88', glowColor: 'rgba(0,255,136,0.3)', width: 1.5 },
  { angle: -76, color: '#00ccff', glowColor: 'rgba(0,204,255,0.3)', width: 2 },
  { angle: -70, color: '#00ffcc', glowColor: 'rgba(0,255,204,0.25)', width: 1.5 },
  { angle: -64, color: '#3366ff', glowColor: 'rgba(51,102,255,0.3)', width: 2 },
  { angle: -58, color: '#00ff66', glowColor: 'rgba(0,255,102,0.25)', width: 1.5 },
  { angle: -52, color: '#ff3366', glowColor: 'rgba(255,51,102,0.3)', width: 2 },
  { angle: -46, color: '#ff0088', glowColor: 'rgba(255,0,136,0.3)', width: 1.8 },
  { angle: -40, color: '#00ccff', glowColor: 'rgba(0,204,255,0.3)', width: 2 },
  { angle: -34, color: '#6633ff', glowColor: 'rgba(102,51,255,0.3)', width: 2 },
  { angle: -28, color: '#ff3366', glowColor: 'rgba(255,51,102,0.25)', width: 1.5 },
  { angle: -22, color: '#00ffee', glowColor: 'rgba(0,255,238,0.3)', width: 2 },
  { angle: -16, color: '#ff00ff', glowColor: 'rgba(255,0,255,0.3)', width: 1.8 },
  { angle: -10, color: '#ffff00', glowColor: 'rgba(255,255,0,0.2)', width: 1.2 },
  { angle: -4, color: '#ff4444', glowColor: 'rgba(255,68,68,0.3)', width: 2 },
  { angle: 2, color: '#00ff88', glowColor: 'rgba(0,255,136,0.3)', width: 1.8 },
  { angle: 8, color: '#ff0088', glowColor: 'rgba(255,0,136,0.3)', width: 1.8 },
  { angle: 14, color: '#00ccff', glowColor: 'rgba(0,204,255,0.25)', width: 1.5 },
  { angle: 20, color: '#ff6600', glowColor: 'rgba(255,102,0,0.3)', width: 2 },
  { angle: 26, color: '#00ffee', glowColor: 'rgba(0,255,238,0.3)', width: 2 },
  { angle: 32, color: '#ff3300', glowColor: 'rgba(255,51,0,0.3)', width: 2 },
  { angle: 38, color: '#ff66cc', glowColor: 'rgba(255,102,204,0.25)', width: 1.5 },
  { angle: 44, color: '#00ffcc', glowColor: 'rgba(0,255,204,0.3)', width: 2 },
  { angle: 50, color: '#3366ff', glowColor: 'rgba(51,102,255,0.3)', width: 2 },
  { angle: 56, color: '#ff00ff', glowColor: 'rgba(255,0,255,0.25)', width: 1.5 },
  { angle: 62, color: '#ff6600', glowColor: 'rgba(255,102,0,0.3)', width: 1.8 },
  { angle: 68, color: '#00ff66', glowColor: 'rgba(0,255,102,0.3)', width: 2 },
  { angle: 74, color: '#3333ff', glowColor: 'rgba(51,51,255,0.3)', width: 2 },
  { angle: 80, color: '#ff3333', glowColor: 'rgba(255,50,50,0.3)', width: 1.8 },
  { angle: 88, color: '#00ff88', glowColor: 'rgba(0,255,136,0.25)', width: 1.5 },
];

const LaserBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Dark background gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h * 1.2, 0, w / 2, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, '#1a0a2e');
    bgGrad.addColorStop(0.4, '#0d0d2b');
    bgGrad.addColorStop(1, '#050515');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Origin point: bottom center
    const ox = w / 2;
    const oy = h + 10;
    const beamLength = Math.max(w, h) * 2;

    for (const beam of BEAMS) {
      const rad = (beam.angle * Math.PI) / 180;
      const ex = ox + Math.sin(rad) * beamLength;
      const ey = oy - Math.cos(rad) * beamLength;

      // Wide glow
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = beam.glowColor;
      ctx.lineWidth = beam.width * 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Medium glow
      ctx.strokeStyle = beam.glowColor;
      ctx.lineWidth = beam.width * 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Bright core
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width * 0.5;
      ctx.shadowColor = beam.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.restore();
    }

    // Subtle vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    let observer: ResizeObserver | undefined;
    if (parent) {
      observer = new ResizeObserver(() => {
        requestAnimationFrame(draw);
      });
      observer.observe(parent);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [draw]);

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

export default LaserBackground;
