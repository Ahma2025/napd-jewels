"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import { formatPrice, priceInfo, productName } from "@/lib/productDisplay";
import { useLang } from "../context/LangContext";
import Reveal from "./Reveal";
import Tilt from "./Tilt";
import Spotlight from "./Spotlight";
import MaskHeading from "./MaskHeading";

/** The vitrine continues below the hero: every Moissanite piece in its own niche. */
export default function MoissaniteEdit() {
  const { items, loading } = useCollection("MOISSANITE");
  const { lang, t } = useLang();
  if (!loading && items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-napd-deep py-20 text-napd-ivory md:py-28">
      <Spotlight />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MaskHeading className="napd-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.95]">
              {t("edit.before")} <span className="napd-script napd-foil napd-flourish">{t("edit.flourish")}</span>
            </MaskHeading>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-napd-ivory/70">
              {t("edit.body")}
            </p>
          </div>
          <Link
            href="/moissanite"
            className="napd-link napd-caps inline-flex shrink-0 items-center gap-2 self-start text-[11.5px] text-napd-goldsoft md:self-auto"
          >
            {t("edit.cta")}
            <ArrowRight aria-hidden="true" strokeWidth={1.5} className="napd-flip h-3.5 w-3.5" />
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
                    <div className="napd-card-media relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[4px] border border-napd-gold/25 bg-white">
                      <div className="absolute inset-[12%]">
                        <Image
                          src={p.image_url || "/hero.jpeg"}
                          alt={productName(p, lang)}
                          fill
                          sizes="260px"
                          className="napd-card-img object-contain"
                        />
                      </div>
                      <span aria-hidden="true" className="napd-niche-glow pointer-events-none absolute inset-0" />
                      <span aria-hidden="true" className="napd-shine pointer-events-none absolute inset-0" />
                    </div>
                    </Tilt>
                    <p className="napd-card-name mt-6 text-center text-[12.5px] leading-snug text-napd-ivory">
                      {productName(p, lang)}
                    </p>
                    <p className="mt-2 flex justify-center gap-2 text-[13px] tracking-[0.14em] tabular-nums">
                      <span className="text-napd-goldsoft">{formatPrice(final)}</span>
                      {hasDiscount && (
                        <span className="text-napd-ivory/40 line-through">{formatPrice(original)}</span>
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
