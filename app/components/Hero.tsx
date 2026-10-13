"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, MessageCircle } from "lucide-react";
import GoldDust from "./GoldDust";
import Tilt from "./Tilt";
import { useCollection } from "@/lib/useCollection";
import { formatPrice, priceInfo, productName } from "@/lib/productDisplay";
import { useLang } from "../context/LangContext";
import { useOccasion } from "../context/OccasionContext";
import OccasionMotif, { motifPattern } from "./OccasionMotif";
import OccasionCountdown from "./OccasionCountdown";
import { OccasionSeal } from "./OccasionOrnament";
import { THEMES, occasionCategory, occasionText, roman } from "@/lib/occasion";

const WHATSAPP_URL = "https://wa.me/972593255260";
const ROTATE_MS = 5200;
const MAX_PIECES = 6;

export default function Hero() {
  const occasion = useOccasion();
  const { items: moissanite, loading: loadingHouse } = useCollection("MOISSANITE");
  // during an occasion the niche shows the collection its campaign leads to
  const { items: seasonal, loading: loadingSeason } = useCollection(occasion ? occasionCategory(occasion) : "MOISSANITE");
  const { lang, t } = useLang();
  const ar = lang === "ar";
  const name = (p: (typeof moissanite)[number]) => productName(p, lang);
  const source = occasion && seasonal.length ? seasonal : moissanite;
  const loading = occasion ? loadingSeason && loadingHouse : loadingHouse;
  const pieces = source.slice(0, MAX_PIECES);
  const theme = occasion ? THEMES[occasion.theme] ?? THEMES.eid : null;
  const occ = occasion ? occasionText(occasion, lang) : null;
  const year = occasion ? Number(occasion.occasion_date.slice(0, 4)) : 0;
  const waHref = occasion
    ? `${WHATSAPP_URL}?text=${encodeURIComponent(`${t("occasion.waText")}${ar ? "" : " "}${occ!.name}`)}`
    : WHATSAPP_URL;
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
      className="napd-hero relative isolate overflow-hidden text-napd-ivory"
      aria-label="NAPD Jewels"
    >
      {/* velvet, the NAPD monogram as a watermark, and the gold dust */}
      <div aria-hidden="true" className="napd-hero-velvet absolute inset-0 -z-20" />
      <div aria-hidden="true" className="napd-hero-mark pointer-events-none absolute -z-10" />
      <GoldDust className="-z-10" />
      {occasion && theme && (
        <div aria-hidden="true" className="napd-hero-field pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: motifPattern(theme.motif, "#ffffff") }} />
      )}

      <p
        aria-hidden="true"
        className="napd-hero-side pointer-events-none absolute left-7 top-1/2 hidden text-[10px] uppercase tracking-[0.42em] text-napd-goldsoft/55 xl:block"
      >
        {occasion && occ ? `${occ.name} · ${roman(year)}` : t("hero.side")}
      </p>

      <div className="mx-auto grid max-w-[1280px] items-center gap-y-9 px-5 pb-20 pt-10 md:px-8 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[1fr_auto_1fr] lg:gap-x-14 lg:pb-24 lg:pt-14">
        <h1 className="sr-only">{t("hero.sr")}</h1>

        {/* Line one, set against the top of the niche */}
        <p
          aria-hidden="true"
          className={`napd-hero-serif napd-depth-fast text-center leading-[0.95] lg:self-start lg:pt-[9vh] lg:text-end ${
            occ && !ar ? "text-[clamp(2.4rem,4.4vw,4.6rem)]" : "text-[clamp(3.2rem,6.4vw,6.8rem)] whitespace-nowrap"
          }`}
        >
          {occ ? (
            <span className={`block ${ar ? "" : "italic"}`}>
              <Chars text={occ.headline || occ.name} start={250} words={ar} />
            </span>
          ) : ar ? (
            <>
              <span className="block">
                <Chars text="قطعة" start={250} words />
              </span>
              <span className="block">
                <Chars text="استثنائية،" start={520} words />
              </span>
            </>
          ) : (
            <>
              <span className="mb-[0.12em] block text-[0.6em]">
                <Chars text="Exceptional" start={250} />
              </span>
              <span className="block italic">
                <Chars text="piece," start={680} />
              </span>
            </>
          )}
        </p>

        {/* The vitrine niche */}
        <div
          className="napd-depth-slow relative mx-auto w-[min(74vw,350px)] lg:w-[clamp(300px,27vw,400px)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div aria-hidden="true" className="napd-halo pointer-events-none absolute -inset-16 -z-10" />
          {occasion && theme && (
            <OccasionSeal
              motif={theme.motif}
              text={`NAPD JEWELS · ${occasion.name_en.toUpperCase()} · ${roman(year)} · `}
              className="pointer-events-none absolute left-1/2 top-[42%] -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 text-napd-goldsoft/30"
            />
          )}
          <Tilt max={10} lift={18} className="napd-float">
            <div className="relative">
              {/* display-case frame with a gold apex, around the arch only */}
              <span
                aria-hidden="true"
                className="napd-frame-draw pointer-events-none absolute -inset-3 rounded-t-[999px] rounded-b-[6px] border border-napd-gold/40"
              >
                {theme ? (
                  <span className="absolute left-1/2 top-[-22px] grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-napd-gold/50 bg-napd-deep text-napd-accent">
                    <OccasionMotif motif={theme.motif} strokeWidth={1.3} className="h-6 w-6" />
                  </span>
                ) : (
                  <span className="absolute left-1/2 top-[-5px] h-[9px] w-[9px] -translate-x-1/2 rotate-45 bg-napd-gold" />
                )}
              </span>
              <Link
                href={current ? `/product/${current.id}` : occasion?.cta_href || "/moissanite"}
                className="napd-niche napd-arch-reveal relative block aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[4px] bg-white"
                aria-label={current ? `${t("hero.view")} ${name(current)}` : t("hero.edit")}
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
                      alt={i === active ? name(p) : ""}
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
              <p className="napd-hero-serif text-[13px] italic tracking-[0.2em] text-napd-goldsoft tabular-nums">
                <span className="not-italic text-napd-ivory">{String(active + 1).padStart(2, "0")}</span>
                &nbsp;&nbsp;/&nbsp;&nbsp;{String(pieces.length).padStart(2, "0")}
              </p>
            )}
            {current && price ? (
              <div key={current.id} className="napd-caption-in">
                <p className="napd-hero-serif mt-2 text-[1.3rem] italic leading-snug text-napd-ivory md:text-[1.4rem]">
                  {name(current)}
                </p>
                <p className="mt-1.5 text-[12px] tracking-[0.24em] text-napd-goldsoft tabular-nums">
                  {formatPrice(price.final)}
                </p>
              </div>
            ) : (
              <p className="napd-hero-serif mt-2 text-[1.3rem] italic text-napd-ivory/70">
                {occ ? `${t("occasion.edit")} · ${occ.name}` : t("hero.edit")}
              </p>
            )}
            {pieces.length > 1 && (
              <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={t("hero.featured")}>
                {pieces.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`${t("hero.show")} ${name(p)}`}
                    onClick={() => setActive(i)}
                    className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
                      i === active ? "w-7 bg-napd-goldsoft" : "w-3 bg-napd-ivory/25 hover:bg-napd-ivory/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Line two, the flourish, and the offer */}
        <div className="text-center lg:self-end lg:pb-[8vh] lg:text-start">
          {occ ? (
            <p aria-hidden="true" className="napd-depth-fast">
              <span
                className={`napd-script napd-foil napd-write block leading-[1.05] ${
                  occ.flourish.length > 12
                    ? "text-[clamp(3.4rem,6vw,6.2rem)]"
                    : "text-[clamp(4.6rem,8.5vw,8.5rem)]"
                }`}
              >
                {occ.flourish || occ.name}
              </span>
            </p>
          ) : ar ? (
            <p aria-hidden="true" className="napd-depth-fast">
              <span className="napd-script napd-foil napd-write block text-[clamp(5rem,8.5vw,8.5rem)] leading-[1.15]">
                لذوقٍ
              </span>
              <span className="napd-hero-serif block text-[clamp(3.2rem,6.4vw,6.8rem)] whitespace-nowrap leading-[1.1]">
                <Chars text="استثنائي." start={1500} words />
              </span>
            </p>
          ) : (
            <p aria-hidden="true" className="napd-depth-fast">
              <span className="napd-hero-serif block text-[clamp(1.5rem,2.6vw,2.9rem)] whitespace-nowrap leading-[0.9]">
                <Chars text="for exceptional" start={900} />
              </span>
              <span className="napd-script napd-foil napd-write block text-[clamp(6.4rem,12vw,11.5rem)] leading-[0.8] lg:ms-[0.2em]">
                taste.
              </span>
            </p>
          )}

          <div
            aria-hidden="true"
            className="napd-rise mt-7 flex items-center justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "1500ms" }}
          >
            <span className="h-px w-14 bg-napd-gold/60" />
            <span className="h-[6px] w-[6px] rotate-45 bg-napd-gold" />
            <span className="h-px w-14 bg-napd-gold/60" />
          </div>

          <p
            className="napd-rise mx-auto mt-6 max-w-[34ch] text-[15px] leading-[1.75] text-napd-ivory/72 lg:mx-0"
            style={{ animationDelay: "1600ms" }}
          >
            {occ?.subline || t("hero.sub")}
          </p>

          <div
            className="napd-rise mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
            style={{ animationDelay: "1720ms" }}
          >
            <a
              href={occasion ? occasion.cta_href || "#occasion" : "#collection"}
              className="napd-btn napd-caps inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-napd-ivory px-8 text-[12px] text-napd-ink"
            >
              {occasion ? t("occasion.shop") : t("hero.shop")}
              {occasion ? (
                <ArrowRight aria-hidden="true" strokeWidth={1.5} className="napd-flip h-4 w-4" />
              ) : (
                <ArrowDown aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              )}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="napd-caps inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-napd-ivory/30 px-8 text-[12px] text-napd-ivory transition-colors duration-200 hover:border-napd-ivory/70"
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              {occasion ? t("occasion.whatsapp") : t("hero.whatsapp")}
            </a>
          </div>

          {occasion && (
            <div className="napd-rise mt-10 flex flex-col items-center gap-4 lg:items-start" style={{ animationDelay: "1850ms" }}>
              <p className="napd-caps text-[10.5px] text-napd-goldsoft/80">
                {t("occasion.until")} {occ!.name}
              </p>
              <OccasionCountdown occasion={occasion} className="text-napd-ivory" />
            </div>
          )}
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#collection"
        aria-label={t("hero.scrollLabel")}
        className="napd-scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-[9px] uppercase tracking-[0.4em] text-napd-goldsoft/60 lg:flex"
      >
        {t("hero.scroll")}
        <span aria-hidden="true" className="napd-scroll-line block h-10 w-px" />
      </a>
    </section>
  );
}

/** Splits a line into letters that rise in one after another. */
function Chars({
  text,
  start = 0,
  words = false,
}: {
  text: string;
  start?: number;
  /** Animate whole words (Arabic letters join, so they must not be split). */
  words?: boolean;
}) {
  if (words) {
    const parts = text.split(" ");
    return (
      <>
        {parts.map((w, i) => (
          <span key={i} className="napd-char" style={{ animationDelay: `${start + i * 140}ms` }}>
            {w}
            {i < parts.length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </>
    );
  }
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
