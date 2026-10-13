"use client";

import Link from "next/link";
import OccasionMotif from "./OccasionMotif";
import OccasionCountdown from "./OccasionCountdown";
import { useOccasion } from "../context/OccasionContext";
import { useLang } from "../context/LangContext";
import { THEMES, occasionText } from "@/lib/occasion";

/** The occasion's line across the top of every page, with the time left. */
export default function OccasionRibbon() {
  const occasion = useOccasion();
  const { lang, t } = useLang();
  if (!occasion) return null;

  const theme = THEMES[occasion.theme] ?? THEMES.eid;
  const text = occasionText(occasion, lang);

  return (
    <Link
      href="/#occasion"
      className="napd-ribbon group relative flex h-10 items-center justify-center gap-4 overflow-hidden bg-napd-deep px-4 text-napd-goldsoft"
    >
      <span aria-hidden="true" className="napd-ribbon-sheen pointer-events-none absolute inset-0" />
      <OccasionMotif motif={theme.motif} className="h-4 w-4 shrink-0 text-napd-accent" strokeWidth={1.4} />
      <span className="napd-caps truncate text-[11px]">{text.name}</span>
      <span aria-hidden="true" className="hidden h-3 w-px bg-current opacity-30 sm:block" />
      <OccasionCountdown occasion={occasion} variant="inline" className="napd-caps text-[11px] tracking-[0.16em] text-napd-ivory/85" />
      <span aria-hidden="true" className="hidden h-3 w-px bg-current opacity-30 md:block" />
      <span className="napd-caps hidden shrink-0 text-[11px] underline-offset-[6px] group-hover:underline md:inline">
        {t("occasion.discover")}
      </span>
    </Link>
  );
}
