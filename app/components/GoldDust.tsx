"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  px: number;
  py: number;
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
      const count = Math.round(Math.min(110, Math.max(36, (w * h) / 14000)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        px: 0,
        py: 0,
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

    const pointer = { x: -9999, y: -9999 };
    const R = 130;
    const step = () => {
      for (const m of motes) {
        // a gentle push away from the hand, which then eases off
        const dx = m.x - pointer.x;
        const dy = m.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * 0.9;
          m.px += (dx / d) * f;
          m.py += (dy / d) * f;
        }
        m.px *= 0.92;
        m.py *= 0.92;
        m.y -= m.vy - m.py;
        m.x += m.vx + m.px;
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
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

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const host = canvas.parentElement;
    host?.addEventListener("pointermove", onPointer);
    host?.addEventListener("pointerleave", onPointerLeave);

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
      host?.removeEventListener("pointermove", onPointer);
      host?.removeEventListener("pointerleave", onPointerLeave);
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
