"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import GoldDust from "./GoldDust";
import Tilt from "./Tilt";
import { useCollection } from "@/lib/useCollection";
import { displayTitle, formatPrice, priceInfo } from "@/lib/productDisplay";

const WHATSAPP_URL = "https://wa.me/972593255260";
const ROTATE_MS = 5200;
const MAX_PIECES = 6;

export default function Hero() {
  const { items: moissanite, loading } = useCollection("MOISSANITE");
  const pieces = moissanite.slice(0, MAX_PIECES);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pieces.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % pieces.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [pieces.length, paused]);

  // scroll depth: the words drift up faster than the niche as you leave the hero
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      el.style.setProperty("--hp", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const current = pieces[active];
  const price = current ? priceInfo(current) : null;

  return (
    <section
      ref={heroRef}
      className="napd-hero relative isolate overflow-hidden text-[#FAF7F1]"
      aria-label="NAPD Jewels"
    >
      {/* velvet, the NAPD monogram as a watermark, and the gold dust */}
      <div aria-hidden="true" className="napd-hero-velvet absolute inset-0 -z-20" />
      <div aria-hidden="true" className="napd-hero-mark pointer-events-none absolute -z-10" />
      <GoldDust className="-z-10" />

      <p
        aria-hidden="true"
        className="napd-hero-side pointer-events-none absolute left-7 top-1/2 hidden text-[10px] uppercase tracking-[0.42em] text-[#D9C6A0]/55 xl:block"
      >
        NAPD Jewels &nbsp;·&nbsp; Sterling Silver 925
      </p>

      <div className="mx-auto grid max-w-[1280px] items-center gap-y-9 px-5 pb-20 pt-10 md:px-8 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[1fr_auto_1fr] lg:gap-x-14 lg:pb-24 lg:pt-14">
        <h1 className="sr-only">A small ring, a big love.</h1>

        {/* Line one, set against the top of the niche */}
        <p
          aria-hidden="true"
          className="napd-hero-serif napd-depth-fast text-center text-[clamp(3.2rem,6.4vw,6.8rem)] whitespace-nowrap leading-[0.9] lg:self-start lg:pt-[9vh] lg:text-right"
        >
          <span className="block">
            <Chars text="A small" start={250} />
          </span>
          <span className="block italic">
            <Chars text="ring," start={520} />
          </span>
        </p>

        {/* The vitrine niche */}
        <div
          className="napd-depth-slow relative mx-auto w-[min(74vw,350px)] lg:w-[clamp(300px,27vw,400px)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div aria-hidden="true" className="napd-halo pointer-events-none absolute -inset-16 -z-10" />
          <Tilt max={10} lift={18} className="napd-float">
            <div className="relative">
              {/* display-case frame with a gold apex, around the arch only */}
              <span
                aria-hidden="true"
                className="napd-frame-draw pointer-events-none absolute -inset-3 rounded-t-[999px] rounded-b-[6px] border border-[#B08D57]/40"
              >
                <span className="absolute left-1/2 top-[-5px] h-[9px] w-[9px] -translate-x-1/2 rotate-45 bg-[#B08D57]" />
              </span>
              <Link
                href={current ? `/product/${current.id}` : "/moissanite"}
                className="napd-niche napd-arch-reveal relative block aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[4px] bg-white"
                aria-label={current ? `View ${displayTitle(current.title)}` : "View the Moissanite Edit"}
              >
                {loading && <div className="napd-skeleton absolute inset-0" />}
                {pieces.map((p, i) => (
                  <div
                    key={p.id}
                    aria-hidden={i !== active}
                    className={`napd-niche-piece absolute inset-[10%] ${i === active ? "is-active" : ""}`}
                  >
                    <Image
                      src={p.image_url || "/hero.jpeg"}
                      alt={i === active ? displayTitle(p.title) : ""}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 400px, 74vw"
                      className="object-contain"
                    />
                  </div>
                ))}
                <span aria-hidden="true" className="napd-niche-glow pointer-events-none absolute inset-0" />
                <span
                  key={active}
                  aria-hidden="true"
                  className="napd-niche-sweep pointer-events-none absolute inset-0"
                />
                <span aria-hidden="true" className="napd-shine pointer-events-none absolute inset-0" />
              </Link>
            </div>
          </Tilt>

          {/* plinth caption */}
          <div className="mt-8 text-center" aria-live="polite">
            {pieces.length > 1 && (
              <p className="napd-hero-serif text-[13px] italic tracking-[0.2em] text-[#D9C6A0] tabular-nums">
                <span className="not-italic text-[#FAF7F1]">{String(active + 1).padStart(2, "0")}</span>
                &nbsp;&nbsp;/&nbsp;&nbsp;{String(pieces.length).padStart(2, "0")}
              </p>
            )}
            {current && price ? (
              <div key={current.id} className="napd-caption-in">
                <p className="napd-hero-serif mt-2 text-[1.3rem] italic leading-snug text-[#FAF7F1] md:text-[1.4rem]">
                  {displayTitle(current.title)}
                </p>
                <p className="mt-1.5 text-[12px] tracking-[0.24em] text-[#D9C6A0] tabular-nums">
                  {formatPrice(price.final)}
                </p>
              </div>
            ) : (
              <p className="napd-hero-serif mt-2 text-[1.3rem] italic text-[#FAF7F1]/70">
                The Moissanite Edit
              </p>
            )}
            {pieces.length > 1 && (
              <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Featured pieces">
                {pieces.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Show ${displayTitle(p.title)}`}
                    onClick={() => setActive(i)}
                    className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
                      i === active ? "w-7 bg-[#D9C6A0]" : "w-3 bg-[#FAF7F1]/25 hover:bg-[#FAF7F1]/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Line two, the flourish, and the offer */}
        <div className="text-center lg:self-end lg:pb-[8vh] lg:text-left">
          <p aria-hidden="true" className="napd-depth-fast">
            <span className="napd-hero-serif block text-[clamp(3.2rem,6.4vw,6.8rem)] whitespace-nowrap leading-[0.9]">
              <Chars text="a big" start={780} />
            </span>
            <span className="napd-script napd-foil napd-write block text-[clamp(6.4rem,12vw,11.5rem)] leading-[0.8] lg:ml-[0.2em]">
              love.
            </span>
          </p>

          <div
            aria-hidden="true"
            className="napd-rise mt-7 flex items-center justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "1500ms" }}
          >
            <span className="h-px w-14 bg-[#B08D57]/60" />
            <span className="h-[6px] w-[6px] rotate-45 bg-[#B08D57]" />
            <span className="h-px w-14 bg-[#B08D57]/60" />
          </div>

          <p
            className="napd-rise mx-auto mt-6 max-w-[34ch] text-[15px] leading-[1.75] text-[#FAF7F1]/72 lg:mx-0"
            style={{ animationDelay: "1600ms" }}
          >
            Sterling silver 925 and moissanite, chosen piece by piece for the
            moments she will remember.
          </p>

          <div
            className="napd-rise mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
            style={{ animationDelay: "1720ms" }}
          >
            <a
              href="#collection"
              className="napd-btn inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#FAF7F1] px-7 text-[12px] uppercase tracking-[0.18em] text-[#182B2A]"
            >
              Shop the collection
              <ArrowDown aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#FAF7F1]/30 px-7 text-[12px] uppercase tracking-[0.18em] text-[#FAF7F1] transition-colors duration-200 hover:border-[#FAF7F1]/70"
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#collection"
        aria-label="Scroll to the collection"
        className="napd-scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-[9px] uppercase tracking-[0.4em] text-[#D9C6A0]/60 lg:flex"
      >
        Scroll
        <span aria-hidden="true" className="napd-scroll-line block h-10 w-px" />
      </a>
    </section>
  );
}

/** Splits a line into letters that rise in one after another. */
function Chars({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span
          key={i}
          className="napd-char"
          style={{ animationDelay: `${start + i * 38}ms` }}
        >
          {c === " " ? "\u00a0" : c}
        </span>
      ))}
    </>
  );
}
