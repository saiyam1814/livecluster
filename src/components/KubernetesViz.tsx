"use client";

import { useEffect, useRef, useCallback } from "react";
import type { User } from "@/lib/types";

interface KubernetesVizProps {
  users: User[];
  celebrating: boolean;
}

interface PodState {
  id: string;
  name: string;
  // Current position (animating)
  x: number;
  y: number;
  // Target orbital position
  targetX: number;
  targetY: number;
  // Spawn position
  startX: number;
  startY: number;
  // Animation progress 0-1
  progress: number;
  // Orbital params
  ringIndex: number;
  angle: number;
  // Visual
  hue: number;
  burstParticles: { x: number; y: number; vx: number; vy: number; life: number }[] | null;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

const K8S_BLUE = "#326CE5";
const POD_COLORS = ["#326CE5", "#4A90D9", "#6BB5FF", "#2D5BB9", "#5A9BEF"];
const PODS_PER_RING = 8;

export default function KubernetesViz({ users, celebrating }: KubernetesVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const podsRef = useRef<Map<string, PodState>>(new Map());
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const getOrbitalPosition = useCallback((index: number, cx: number, cy: number) => {
    const ring = Math.floor(index / PODS_PER_RING);
    const posInRing = index % PODS_PER_RING;
    const podsInThisRing = PODS_PER_RING + ring * 3; // More pods in outer rings
    const angle = (posInRing / podsInThisRing) * Math.PI * 2;
    const radius = 120 + ring * 85;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      ringIndex: ring,
      angle,
    };
  }, []);

  const getSpawnEdge = useCallback((w: number, h: number) => {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Math.random() * w, y: -40 };
      case 1: return { x: w + 40, y: Math.random() * h };
      case 2: return { x: Math.random() * w, y: h + 40 };
      default: return { x: -40, y: Math.random() * h };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Generate stars
      if (starsRef.current.length === 0) {
        const stars: Star[] = [];
        for (let i = 0; i < 200; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
          });
        }
        starsRef.current = stars;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawPodIcon = (x: number, y: number, size: number, color: string, name: string, alpha: number) => {
      ctx.globalAlpha = alpha;

      // Pod body (rounded rect)
      const w = size * 2;
      const h = size * 1.4;
      const r = 4;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pod name
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.max(9, size * 0.5)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayName = name.length > 10 ? name.slice(0, 9) + "…" : name;
      ctx.fillText(displayName, x, y);

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Clear
      ctx.fillStyle = "#0a0e27";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const star of starsRef.current) {
        const a = star.alpha + Math.sin(t * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, a)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sync pods with users
      const currentIds = new Set(users.map((u) => u.id));
      // Remove old
      Array.from(podsRef.current.keys()).forEach((id) => {
        if (!currentIds.has(id)) podsRef.current.delete(id);
      });
      // Add new
      users.forEach((user, i) => {
        if (!podsRef.current.has(user.id)) {
          const orbital = getOrbitalPosition(i, cx, cy);
          const spawn = getSpawnEdge(w, h);
          podsRef.current.set(user.id, {
            id: user.id,
            name: user.name,
            x: spawn.x,
            y: spawn.y,
            targetX: orbital.x,
            targetY: orbital.y,
            startX: spawn.x,
            startY: spawn.y,
            progress: 0,
            ringIndex: orbital.ringIndex,
            angle: orbital.angle,
            hue: Math.random() * 360,
            burstParticles: null,
          });
        } else {
          // Update target if position changed
          const pod = podsRef.current.get(user.id)!;
          const orbital = getOrbitalPosition(i, cx, cy);
          pod.targetX = orbital.x;
          pod.targetY = orbital.y;
        }
      });

      // Draw orbital rings (faint)
      const numRings = Math.ceil(users.length / PODS_PER_RING) || 0;
      for (let r = 0; r < numRings; r++) {
        const radius = 120 + r * 85;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(50, 108, 229, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw connection lines
      Array.from(podsRef.current.values()).forEach((pod) => {
        if (pod.progress < 0.3) return;
        const alpha = Math.min((pod.progress - 0.3) * 1.4, 0.15);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pod.x, pod.y);
        ctx.strokeStyle = `rgba(50, 108, 229, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Central KCD hexagon
      const hexSize = 50 + Math.sin(t * 2) * 3;
      const glowSize = 70 + Math.sin(t * 1.5) * 10;

      // Glow
      const gradient = ctx.createRadialGradient(cx, cy, hexSize * 0.5, cx, cy, glowSize);
      gradient.addColorStop(0, "rgba(50, 108, 229, 0.3)");
      gradient.addColorStop(1, "rgba(50, 108, 229, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Hexagon fill
      drawHexagon(cx, cy, hexSize);
      ctx.fillStyle = K8S_BLUE;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // KCD text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("KCD", cx, cy);

      // Animate & draw pods
      Array.from(podsRef.current.values()).forEach((pod) => {
        // Celebration burst
        if (celebrating && !pod.burstParticles) {
          const particles = [];
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8;
            particles.push({
              x: pod.x,
              y: pod.y,
              vx: Math.cos(a) * (1 + Math.random() * 2),
              vy: Math.sin(a) * (1 + Math.random() * 2),
              life: 1,
            });
          }
          pod.burstParticles = particles;
        }

        if (pod.burstParticles) {
          for (const p of pod.burstParticles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            if (p.life > 0) {
              ctx.fillStyle = `rgba(50, 108, 229, ${p.life * 0.6})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Animate inward
        if (pod.progress < 1) {
          pod.progress = Math.min(pod.progress + 0.012, 1);
          const ease = 1 - Math.pow(1 - pod.progress, 3); // ease-out cubic
          pod.x = pod.startX + (pod.targetX - pod.startX) * ease;
          pod.y = pod.startY + (pod.targetY - pod.startY) * ease;
        } else {
          // Gentle orbital drift
          const drift = Math.sin(t + pod.angle) * 3;
          pod.x = pod.targetX + drift;
          pod.y = pod.targetY + Math.cos(t * 0.7 + pod.angle) * 3;
        }

        const color = POD_COLORS[Math.abs(pod.name.charCodeAt(0)) % POD_COLORS.length];
        const alpha = Math.min(pod.progress * 2, 1);
        drawPodIcon(pod.x, pod.y, 24, color, pod.name, alpha);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [users, celebrating, getOrbitalPosition, getSpawnEdge]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
