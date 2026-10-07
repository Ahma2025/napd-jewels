"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  speed: number;
  base: number;
};

/**
 * Slow, sparse gold motes drifting upward. Pauses when off screen or when the
 * tab is hidden, and renders a still frame for reduced-motion visitors.
 */
export default function GoldDust({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.4,
        vy: 0.06 + Math.random() * 0.18,
        vx: (Math.random() - 0.5) * 0.06,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.01,
        base: 0.15 + Math.random() * 0.45,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const a = m.base * (0.55 + 0.45 * Math.sin(m.phase));
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3.2);
        g.addColorStop(0, `rgba(251, 242, 218, ${a})`);
        g.addColorStop(0.45, `rgba(217, 198, 160, ${a * 0.55})`);
        g.addColorStop(1, "rgba(176, 141, 87, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const m of motes) {
        m.y -= m.vy;
        m.x += m.vx;
        m.phase += m.speed;
        if (m.y < -8) {
          m.y = h + 8;
          m.x = Math.random() * w;
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        draw();
        return;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(step);
    };

    seed();
    start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(() => {
      seed();
      if (reduced) draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
