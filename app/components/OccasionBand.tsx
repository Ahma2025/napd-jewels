"use client";

import Link from "next/link";
import { Gift, MessageCircle, ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { OccasionDivider } from "./OccasionOrnament";
import { useOccasion } from "../context/OccasionContext";
import { useLang } from "../context/LangContext";
import { useCollection } from "@/lib/useCollection";
import { THEMES, occasionCategory, occasionText } from "@/lib/occasion";

const WHATSAPP_NUMBER = "972593255260";
const PIECES = 5;

/** The occasion's edit under the hero: the pieces its campaign leads to, and how we gift them. */
export default function OccasionBand() {
  const occasion = useOccasion();
  const { lang, t } = useLang();
  const { items, loading } = useCollection(occasion ? occasionCategory(occasion) : "MOISSANITE");
  if (!occasion) return null;

  const theme = THEMES[occasion.theme] ?? THEMES.eid;
  const text = occasionText(occasion, lang);
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${t("occasion.waText")}${lang === "ar" ? "" : " "}${text.name}`)}`;
  const pieces = items.slice(0, PIECES);
  if (!loading && !pieces.length) return null;

  const promises = [
    { icon: Gift, label: t("occasion.promiseBox") },
    { icon: ShieldCheck, label: t("occasion.promiseWarranty") },
    { icon: MessageCircle, label: t("occasion.promiseHelp"), href: wa },
  ];

  return (
    <section id="occasion" aria-labelledby="occasion-title" className="relative bg-white pt-20 md:pt-28">
      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        <Reveal className="text-center">
          <p className="napd-caps-wide text-[11px] text-napd-muted">{text.name}</p>
          <OccasionDivider motif={theme.motif} className="mt-6 text-napd-gold" />
          <h2 id="occasion-title" className="napd-display mt-6 text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] text-napd-ink">
            {t("occasion.editTitle")} <span className="italic text-napd-bronze">{text.name}</span>
          </h2>
          {text.subline && (
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-napd-muted">{text.subline}</p>
          )}
        </Reveal>

        <div className="napd-tab-panel napd-row -mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 scrollbar-hide md:mx-0 md:mt-16 md:grid md:grid-cols-5 md:gap-x-8 md:overflow-visible md:px-0">
          {loading
            ? Array.from({ length: PIECES }, (_, i) => (
                <ProductCardSkeleton key={i} className="w-[46vw] max-w-[230px] shrink-0 md:w-auto md:max-w-none" />
              ))
            : pieces.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  sizes="(min-width: 768px) 240px, 46vw"
                  className="w-[46vw] max-w-[230px] shrink-0 snap-start md:w-auto md:max-w-none"
                />
              ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link href={occasion.cta_href || "/"} className="napd-pill">
            {t("occasion.shop")}
          </Link>
        </div>
      </div>

      {/* how every gift leaves the shop */}
      <ul className="mt-20 grid border-y border-napd-ink/[0.08] bg-napd-paper/60 md:mt-24 md:grid-cols-3">
        {promises.map(({ icon: Icon, label, href }, i) => {
          const body = (
            <>
              <Icon aria-hidden="true" strokeWidth={1.2} className="h-5 w-5 text-napd-bronze" />
              <span className="napd-caps text-[11.5px] text-napd-ink/80">{label}</span>
            </>
          );
          return (
            <li
              key={label}
              className={`flex justify-center py-6 md:py-8 ${i > 0 ? "border-t border-napd-ink/[0.08] md:border-s md:border-t-0" : ""}`}
            >
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-70">
                  {body}
                </a>
              ) : (
                <span className="flex items-center gap-3">{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
