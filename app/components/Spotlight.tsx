"use client";

import { useEffect, useRef } from "react";

/** A soft pool of warm light that follows the pointer across a dark section. */
export default function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const t = { x: 50, y: 30, o: 0 };
    const c = { x: 50, y: 30, o: 0 };
    const render = () => {
      c.x += (t.x - c.x) * 0.08;
      c.y += (t.y - c.y) * 0.08;
      c.o += (t.o - c.o) * 0.08;
      el.style.setProperty("--sx", `${c.x}%`);
      el.style.setProperty("--sy", `${c.y}%`);
      el.style.opacity = c.o.toFixed(3);
      const done = Math.abs(t.x - c.x) < 0.05 && Math.abs(t.y - c.y) < 0.05 && Math.abs(t.o - c.o) < 0.005;
      raf = done ? 0 : requestAnimationFrame(render);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      t.x = ((e.clientX - r.left) / r.width) * 100;
      t.y = ((e.clientY - r.top) / r.height) * 100;
      t.o = 1;
      kick();
    };
    const onLeave = () => {
      t.o = 0;
      kick();
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`napd-spotlight pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
