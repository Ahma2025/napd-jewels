"use client";

import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import { occasionStart, type Occasion } from "@/lib/occasion";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A live countdown to the start of the occasion day (Palestine time).
 * `engraved` sets the numerals large in the house serif; `inline` is one
 * tracked line for the ribbon. Renders nothing once the day has come.
 */
export default function OccasionCountdown({
  occasion,
  variant = "engraved",
  className = "",
}: {
  occasion: Occasion;
  variant?: "engraved" | "inline";
  className?: string;
}) {
  const { t } = useLang();
  const target = occasionStart(occasion);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // first paint on the server has no clock; keep the space so nothing jumps
  if (now === null) return <span className={className} aria-hidden="true" />;
  const left = target - now;
  if (left <= 0) return null;
  const p = parts(left);

  if (variant === "inline") {
    return (
      <span className={`tabular-nums ${className}`} dir="ltr">
        {p.d}
        <small className="opacity-60">D</small> {pad(p.h)}
        <small className="opacity-60">H</small> {pad(p.m)}
        <small className="opacity-60">M</small> {pad(p.s)}
        <small className="opacity-60">S</small>
      </span>
    );
  }

  const cells: [number, string][] = [
    [p.d, t("occasion.days")],
    [p.h, t("occasion.hours")],
    [p.m, t("occasion.minutes")],
    [p.s, t("occasion.seconds")],
  ];
  return (
    <div className={`napd-countdown flex items-stretch ${className}`} role="timer" aria-live="off">
      {cells.map(([n, label], i) => (
        <div key={label} className="flex items-stretch">
          {i > 0 && <span aria-hidden="true" className="napd-countdown-sep mx-3 w-px self-center md:mx-5" />}
          <div className="min-w-[3.2rem] text-center md:min-w-[4rem]">
            <span className="napd-countdown-num block tabular-nums">{i === 0 ? n : pad(n)}</span>
            <span className="napd-caps mt-1.5 block text-[9.5px] opacity-70 md:text-[10px]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
