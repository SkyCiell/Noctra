'use client';

import React, { useEffect, useRef } from 'react';

interface AtmosphereCanvasProps {
  particleType: 'rain' | 'snow' | 'stars' | 'fog' | 'sun_dust' | 'storm' | 'aurora';
  density?: number;
  accentColor?: string;
  isDaytime?: boolean;
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  particleType = 'rain',
  density = 60,
  accentColor = '#38bdf8',
  isDaytime = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle objects
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      maxAlpha: number;
      fadeSpeed: number;
      color?: string;
      length?: number;
      phase?: number;
    }

    const particles: Particle[] = [];
    const count = Math.min(180, Math.max(20, density));

    // Initialize particles
    for (let i = 0; i < count; i++) {
      if (particleType === 'rain' || particleType === 'storm') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -1.5 - Math.random() * 2,
          vy: 14 + Math.random() * 12,
          size: 1 + Math.random() * 1.5,
          length: 15 + Math.random() * 25,
          alpha: 0.15 + Math.random() * 0.45,
          maxAlpha: 0.6,
          fadeSpeed: 0,
        });
      } else if (particleType === 'snow') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 1.2 + Math.random() * 2.2,
          size: 1.5 + Math.random() * 3.5,
          alpha: 0.2 + Math.random() * 0.6,
          maxAlpha: 0.8,
          fadeSpeed: 0,
          phase: Math.random() * Math.PI * 2,
        });
      } else if (particleType === 'sun_dust') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.4 - Math.random() * 0.8,
          size: 1.5 + Math.random() * 3.5,
          alpha: Math.random() * 0.7,
          maxAlpha: 0.7,
          fadeSpeed: 0.005 + Math.random() * 0.01,
        });
      } else if (particleType === 'fog') {
        particles.push({
          x: Math.random() * width,
          y: height * 0.3 + Math.random() * height * 0.7,
          vx: 0.2 + Math.random() * 0.5,
          vy: (Math.random() - 0.5) * 0.2,
          size: 80 + Math.random() * 140,
          alpha: 0.03 + Math.random() * 0.08,
          maxAlpha: 0.12,
          fadeSpeed: 0.002,
        });
      } else {
        // stars / aurora / cosmic
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 0.8 + Math.random() * 2.2,
          alpha: Math.random() * 0.9,
          maxAlpha: 0.9,
          fadeSpeed: 0.008 + Math.random() * 0.015,
        });
      }
    }

    let lightningFlash = 0;
    let nextLightningTime = Date.now() + 4000 + Math.random() * 8000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Aurora Borealis waving gradient
      if (particleType === 'aurora' || (!isDaytime && particleType === 'stars')) {
        const time = Date.now() * 0.0006;
        const grad = ctx.createLinearGradient(0, 0, width, height * 0.5);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.03)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= width; x += 40) {
          const wave = Math.sin(x * 0.003 + time) * 40 + Math.cos(x * 0.006 - time * 0.8) * 25;
          ctx.lineTo(x, height * 0.25 + wave);
        }
        ctx.lineTo(width, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Lightning flash in storm mode
      if (particleType === 'storm') {
        const now = Date.now();
        if (now > nextLightningTime) {
          lightningFlash = 0.8;
          nextLightningTime = now + 6000 + Math.random() * 12000;
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(224, 231, 255, ${lightningFlash * 0.35})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.04;
        }
      }

      // Draw and update each particle
      particles.forEach((p) => {
        if (particleType === 'rain' || particleType === 'storm') {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -p.length!;
            p.x = Math.random() * (width + 100);
          }
          if (p.x < -50) p.x = width + 50;

          ctx.strokeStyle = particleType === 'storm' ? 'rgba(199, 210, 254, 0.5)' : 'rgba(186, 230, 253, 0.45)';
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.5, p.y + p.length!);
          ctx.stroke();
        } else if (particleType === 'snow') {
          p.phase! += 0.02;
          p.x += Math.sin(p.phase!) * 0.8 + p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 'sun_dust') {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha += p.fadeSpeed;
          if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
            p.fadeSpeed = -p.fadeSpeed;
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, p.alpha)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (particleType === 'fog') {
          p.x += p.vx;
          if (p.x - p.size > width) p.x = -p.size;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(203, 213, 225, ${p.alpha})`);
          grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Stars
          p.alpha += p.fadeSpeed;
          if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
            p.fadeSpeed = -p.fadeSpeed;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, p.alpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [particleType, density, accentColor, isDaytime]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
