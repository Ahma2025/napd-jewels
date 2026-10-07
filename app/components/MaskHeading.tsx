"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A heading whose words rise out of an invisible slot the first time it
 * scrolls into view. Already visible without JS, above the fold, or for
 * reduced-motion visitors.
 */
export default function MaskHeading({
  as: Tag = "h2",
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`napd-mask ${state === "armed" ? "is-armed" : ""} ${state === "in" ? "is-in" : ""} ${className}`}
    >
      <span className="napd-mask-slot">
        <span className="napd-mask-line">{children}</span>
      </span>
    </Tag>
  );
}
