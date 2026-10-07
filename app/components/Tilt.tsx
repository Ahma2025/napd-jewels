"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Turns its child in 3D toward the pointer, with a soft highlight that follows
 * the cursor across the surface. Only for fine pointers that can hover; still
 * for touch screens and reduced-motion visitors.
 */
export default function Tilt({
  children,
  className = "",
  max = 9,
  lift = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Extra translateZ in px while hovered. */
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    const target = { rx: 0, ry: 0, mx: 50, my: 50, z: 0 };
    const cur = { rx: 0, ry: 0, mx: 50, my: 50, z: 0 };

    const render = () => {
      // critically damped-ish follow: quick to start, soft to settle
      const k = 0.14;
      cur.rx += (target.rx - cur.rx) * k;
      cur.ry += (target.ry - cur.ry) * k;
      cur.mx += (target.mx - cur.mx) * k;
      cur.my += (target.my - cur.my) * k;
      cur.z += (target.z - cur.z) * k;
      el.style.setProperty("--rx", `${cur.rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${cur.ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${cur.mx.toFixed(1)}%`);
      el.style.setProperty("--my", `${cur.my.toFixed(1)}%`);
      el.style.setProperty("--tz", `${cur.z.toFixed(1)}px`);
      const settled =
        Math.abs(target.rx - cur.rx) < 0.01 &&
        Math.abs(target.ry - cur.ry) < 0.01 &&
        Math.abs(target.z - cur.z) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(render);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      target.ry = (px - 0.5) * 2 * max;
      target.rx = -(py - 0.5) * 2 * max;
      target.mx = px * 100;
      target.my = py * 100;
      target.z = lift;
      el.dataset.tilting = "true";
      kick();
    };
    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
      target.mx = 50;
      target.my = 30;
      target.z = 0;
      delete el.dataset.tilting;
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, lift]);

  return (
    <div ref={ref} className={`napd-tilt ${className}`}>
      <div className="napd-tilt-inner">{children}</div>
    </div>
  );
}
