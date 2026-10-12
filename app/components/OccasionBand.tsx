"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import Spotlight from "./Spotlight";
import MaskHeading from "./MaskHeading";
import OccasionMotif, { motifPattern } from "./OccasionMotif";
import { useOccasion } from "../context/OccasionContext";
import { useLang } from "../context/LangContext";
import { daysLeftLabel } from "@/lib/i18n";
import { THEMES, daysUntil, occasionText, todayInPalestine } from "@/lib/occasion";

const WHATSAPP_NUMBER = "972593255260";

/** The seasonal band under the hero: the occasion's line, a countdown, and the way to order. */
export default function OccasionBand() {
  const occasion = useOccasion();
  const { lang, t } = useLang();
  if (!occasion) return null;

  const theme = THEMES[occasion.theme] ?? THEMES.eid;
  const text = occasionText(occasion, lang);
  const days = daysUntil(occasion.occasion_date, todayInPalestine());
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${t("occasion.waText")}${lang === "ar" ? "" : " "}${text.name}`)}`;

  return (
    <section
      id="occasion"
      aria-label={text.name}
      className="napd-occasion relative isolate overflow-hidden py-20 text-[#FAF7F1] md:py-28"
      style={{ backgroundColor: theme.ground, ["--occ-accent" as string]: theme.accent }}
    >
      {/* a faint field of the motif, and a soft light */}
      <div
        aria-hidden="true"
        className="napd-occasion-field absolute inset-0 -z-10"
        style={{ backgroundImage: motifPattern(theme.motif, theme.accent) }}
      />
      <div aria-hidden="true" className="napd-occasion-glow absolute inset-0 -z-10" />
      <Spotlight />

      <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 px-5 md:grid-cols-[1fr_auto] md:gap-16 md:px-8">
        <Reveal className="text-center md:text-start">
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="text-[11px] uppercase tracking-[0.32em]" style={{ color: theme.accent }}>
              {text.name}
            </span>
            {days >= 0 && (
              <span
                className="rounded-full border px-3 py-1 text-[11px] tracking-[0.12em]"
                style={{ borderColor: `${theme.accent}55`, color: `${theme.accent}` }}
              >
                {days === 0 ? t("occasion.today") : daysLeftLabel(lang, days)}
              </span>
            )}
          </div>

          <MaskHeading className="napd-display mt-6 text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02]">
            {text.headline}{" "}
            <span className="napd-script napd-flourish napd-occasion-flourish">{text.flourish}</span>
          </MaskHeading>

          {text.subline && (
            <p className="mx-auto mt-5 max-w-[42ch] text-[15px] leading-relaxed text-[#FAF7F1]/70 md:mx-0">
              {text.subline}
            </p>
          )}

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href={occasion.cta_href || "/"}
              className="napd-btn inline-flex h-12 items-center gap-2 rounded-full bg-[#FAF7F1] px-7 text-[12px] uppercase tracking-[0.18em] text-[#182B2A]"
            >
              {t("occasion.shop")}
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="napd-flip h-4 w-4" />
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border px-7 text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: `${theme.accent}66`, color: theme.accent }}
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              {t("occasion.whatsapp")}
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="hidden justify-center md:flex">
          <div className="napd-occasion-emblem relative grid h-[260px] w-[260px] place-items-center rounded-full border" style={{ borderColor: `${theme.accent}40` }}>
            <span aria-hidden="true" className="absolute inset-4 rounded-full border" style={{ borderColor: `${theme.accent}26` }} />
            <OccasionMotif motif={theme.motif} strokeWidth={0.9} className="napd-occasion-motif h-[150px] w-[150px]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
