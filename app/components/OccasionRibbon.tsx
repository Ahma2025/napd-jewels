"use client";

import Link from "next/link";
import OccasionMotif from "./OccasionMotif";
import { useOccasion } from "../context/OccasionContext";
import { useLang } from "../context/LangContext";
import { THEMES, occasionText } from "@/lib/occasion";

/** A slim line at the very top of the header while an occasion is on. */
export default function OccasionRibbon() {
  const occasion = useOccasion();
  const { lang, t } = useLang();
  if (!occasion) return null;

  const theme = THEMES[occasion.theme] ?? THEMES.eid;
  const text = occasionText(occasion, lang);

  return (
    <Link
      href="/#occasion"
      className="group flex h-9 items-center justify-center gap-3 border-b border-white/10 px-4 text-center"
      style={{ backgroundColor: theme.ground, color: theme.accent }}
    >
      <OccasionMotif motif={theme.motif} className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span className="truncate text-[11px] tracking-[0.16em]">
        <span className="uppercase">{text.name}</span>
        {text.subline && <span className="hidden text-[#FAF7F1]/70 sm:inline"> · {text.subline}</span>}
      </span>
      <span className="hidden shrink-0 text-[11px] uppercase tracking-[0.16em] underline-offset-4 group-hover:underline sm:inline">
        {t("occasion.discover")}
      </span>
    </Link>
  );
}
