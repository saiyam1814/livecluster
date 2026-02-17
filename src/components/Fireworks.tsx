"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  exploded: boolean;
  color: string;
}

const COLORS = [
  "#326CE5", "#4A90D9", "#6BB5FF", "#FFD700", "#FF6B6B",
  "#50C878", "#FF69B4", "#00CED1", "#FFA500", "#DA70D6",
];

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const spawnRocket = () => {
      rockets.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: canvas.height,
        vy: -(6 + Math.random() * 4),
        targetY: canvas.height * (0.15 + Math.random() * 0.35),
        exploded: false,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.008,
          color,
          size: 2 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(10, 14, 39, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn rockets periodically
      frame++;
      if (frame % 40 === 0) spawnRocket();
      if (frame % 70 === 0) spawnRocket();

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (!r.exploded) {
          r.y += r.vy;

          // Trail
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
          ctx.fill();

          if (r.y <= r.targetY) {
            r.exploded = true;
            explode(r.x, r.y, r.color);
          }
        }
        if (r.exploded) rockets.splice(i, 1);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gravity
        p.vx *= 0.99;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(animate);
    };

    // Initial burst
    spawnRocket();
    spawnRocket();
    spawnRocket();

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-40 pointer-events-none"
    />
  );
}
