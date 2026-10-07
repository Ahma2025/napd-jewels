"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import { displayTitle, formatPrice, priceInfo } from "@/lib/productDisplay";
import Reveal from "./Reveal";
import Tilt from "./Tilt";
import Spotlight from "./Spotlight";
import MaskHeading from "./MaskHeading";

/** The vitrine continues below the hero: every Moissanite piece in its own niche. */
export default function MoissaniteEdit() {
  const { items, loading } = useCollection("MOISSANITE");
  if (!loading && items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#0E1B1A] py-20 text-[#FAF7F1] md:py-28">
      <Spotlight />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MaskHeading className="napd-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.95]">
              The Moissanite <span className="napd-script napd-foil napd-flourish">Edit</span>
            </MaskHeading>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-[#FAF7F1]/70">
              A stone with more fire than a diamond, set in sterling silver.
              Made to be noticed across the room.
            </p>
          </div>
          <Link
            href="/moissanite"
            className="napd-link inline-flex shrink-0 items-center gap-2 self-start text-[11px] uppercase tracking-[0.2em] text-[#D9C6A0] md:self-auto"
          >
            View the edit
            <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>

      <div className="napd-rail relative mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 scroll-px-5 scrollbar-hide md:gap-8 md:px-8 md:scroll-px-8 xl:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[64vw] max-w-[260px] shrink-0">
                <div className="napd-skeleton aspect-[3/4] rounded-t-[999px] rounded-b-[4px] opacity-20" />
              </div>
            ))
          : items.map((p, i) => {
              const { final, original, hasDiscount } = priceInfo(p);
              return (
                <Reveal
                  key={p.id}
                  delay={Math.min(i, 4) * 80}
                  className="w-[64vw] max-w-[260px] shrink-0 snap-start"
                >
                  <Link href={`/product/${p.id}`} className="napd-card group block">
                    <Tilt max={9} lift={12}>
                    <div className="napd-card-media relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[4px] border border-[#B08D57]/25 bg-white">
                      <div className="absolute inset-[12%]">
                        <Image
                          src={p.image_url || "/hero.jpeg"}
                          alt={displayTitle(p.title)}
                          fill
                          sizes="260px"
                          className="napd-card-img object-contain"
                        />
                      </div>
                      <span aria-hidden="true" className="napd-niche-glow pointer-events-none absolute inset-0" />
                      <span aria-hidden="true" className="napd-shine pointer-events-none absolute inset-0" />
                    </div>
                    </Tilt>
                    <p className="napd-display mt-5 text-center text-[1.2rem] italic leading-snug">
                      {displayTitle(p.title)}
                    </p>
                    <p className="mt-1 flex justify-center gap-2 text-[13px] tracking-[0.08em] tabular-nums">
                      <span className="text-[#D9C6A0]">{formatPrice(final)}</span>
                      {hasDiscount && (
                        <span className="text-[#FAF7F1]/40 line-through">{formatPrice(original)}</span>
                      )}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
      </div>
    </section>
  );
}
