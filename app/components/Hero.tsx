"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import GoldDust from "./GoldDust";
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

  const current = pieces[active];
  const price = current ? priceInfo(current) : null;

  return (
    <section
      className="napd-hero relative isolate overflow-hidden text-[#FAF7F1]"
      aria-label="NAPD Jewels"
    >
      {/* velvet + spotlight */}
      <div aria-hidden="true" className="napd-hero-velvet absolute inset-0 -z-20" />
      <GoldDust className="-z-10" />

      <div className="mx-auto grid max-w-[1280px] items-center gap-y-10 px-5 pb-16 pt-12 md:px-8 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[1fr_auto_1fr] lg:gap-x-12 lg:pb-20 lg:pt-14">
        {/* Line one, set against the top of the niche */}
        <h1 className="sr-only">A small ring, a big love.</h1>
        <p aria-hidden="true" className="napd-display napd-rise text-center text-[clamp(3.1rem,8.4vw,7.4rem)] leading-[0.92] lg:self-start lg:pt-[8vh] lg:text-right">
          <span className="block">A small</span>
          <span className="block">ring,</span>
        </p>

        {/* The vitrine niche */}
        <div
          className="relative mx-auto w-[min(76vw,360px)] lg:w-[clamp(300px,27vw,400px)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-t-[999px] rounded-b-[6px] border border-[#B08D57]/35"
          />
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
                  sizes="(min-width: 1024px) 400px, 76vw"
                  className="object-contain"
                />
              </div>
            ))}
            {/* the niche's own light */}
            <span aria-hidden="true" className="napd-niche-glow pointer-events-none absolute inset-0" />
            <span
              key={active}
              aria-hidden="true"
              className="napd-niche-sweep pointer-events-none absolute inset-0"
            />
          </Link>

          {/* plinth caption */}
          <div className="mt-6 text-center" aria-live="polite">
            {current && price ? (
              <>
                <p className="napd-display text-[1.35rem] italic text-[#FAF7F1]">
                  {displayTitle(current.title)}
                </p>
                <p className="mt-1 text-[13px] tracking-[0.12em] text-[#D9C6A0] tabular-nums">
                  {formatPrice(price.final)}
                </p>
              </>
            ) : (
              <p className="napd-display text-[1.35rem] italic text-[#FAF7F1]/70">
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

        {/* Line two + the offer */}
        <div className="text-center lg:self-end lg:pb-[10vh] lg:text-left">
          <p
            className="napd-display napd-rise text-[clamp(3.1rem,8.4vw,7.4rem)] leading-[0.92]"
            style={{ animationDelay: "120ms" }}
            aria-hidden="true"
          >
            <span className="block">a big</span>
            <span className="block italic text-[#D9C6A0]">love.</span>
          </p>

          <p
            className="napd-rise mx-auto mt-7 max-w-[34ch] text-[15px] leading-relaxed text-[#FAF7F1]/75 lg:mx-0"
            style={{ animationDelay: "240ms" }}
          >
            Sterling silver 925 and moissanite, chosen piece by piece for the
            moments she will remember.
          </p>

          <div
            className="napd-rise mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "360ms" }}
          >
            <a
              href="#collection"
              className="napd-btn inline-flex h-12 items-center gap-2 rounded-full bg-[#FAF7F1] px-6 text-[12px] uppercase tracking-[0.18em] text-[#182B2A]"
            >
              Shop the collection
              <ArrowDown aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#FAF7F1]/30 px-6 text-[12px] uppercase tracking-[0.18em] text-[#FAF7F1] transition-colors duration-200 hover:border-[#FAF7F1]/70"
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
