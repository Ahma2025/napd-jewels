// Seasonal occasions (Ramadan, Eid, Mother's Day...). Rows live in the shared
// Supabase table `occasions`, edited from the NAPD CRM. While today is between
// site_from and site_to, the storefront shows that occasion's ribbon and band.

import type { Lang } from "./i18n";

export type OccasionTheme =
  | "ramadan"
  | "eid"
  | "valentine"
  | "mothers"
  | "womens_day"
  | "christmas"
  | "black_friday"
  | "weddings"
  | "graduation";

export type Occasion = {
  slug: string;
  name_ar: string;
  name_en: string;
  theme: OccasionTheme;
  occasion_date: string; // YYYY-MM-DD
  site_from: string;
  site_to: string;
  headline_ar: string | null;
  headline_en: string | null;
  flourish_ar: string | null;
  flourish_en: string | null;
  subline_ar: string | null;
  subline_en: string | null;
  cta_href: string;
};

export const OCCASION_COLUMNS =
  "slug,name_ar,name_en,theme,occasion_date,site_from,site_to,headline_ar,headline_en,flourish_ar,flourish_en,subline_ar,subline_en,cta_href";

export type Motif = "crescent" | "heart" | "flower" | "star" | "tag" | "rings" | "cap";

/** Colors stay inside the brand: a deep ground, and one accent per occasion. */
export const THEMES: Record<OccasionTheme, { ground: string; accent: string; motif: Motif }> = {
  ramadan: { ground: "#0E1B1A", accent: "#D9C6A0", motif: "crescent" },
  eid: { ground: "#122520", accent: "#E4C98F", motif: "crescent" },
  valentine: { ground: "#2A1519", accent: "#E3A6AC", motif: "heart" },
  mothers: { ground: "#26191D", accent: "#E9BDB8", motif: "flower" },
  womens_day: { ground: "#231A27", accent: "#DCC0E2", motif: "flower" },
  christmas: { ground: "#10201B", accent: "#D4B26A", motif: "star" },
  black_friday: { ground: "#0B0C0C", accent: "#B08D57", motif: "tag" },
  weddings: { ground: "#182B2A", accent: "#EFE6D3", motif: "rings" },
  graduation: { ground: "#132232", accent: "#D9C6A0", motif: "cap" },
};

/** Today's date in Palestine, as YYYY-MM-DD. */
export function todayInPalestine(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hebron",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Of the occasions whose window includes today, the one happening soonest
 * wins (e.g. Ramadan's first days over Valentine's, then Valentine's week).
 */
export function pickOccasion(rows: Occasion[], today: string): Occasion | null {
  const live = rows.filter((o) => o.site_from <= today && o.site_to >= today);
  if (!live.length) return null;
  const upcoming = live.filter((o) => o.occasion_date >= today).sort((a, b) => a.occasion_date.localeCompare(b.occasion_date));
  if (upcoming.length) return upcoming[0];
  return live.sort((a, b) => b.occasion_date.localeCompare(a.occasion_date))[0];
}

export function daysUntil(date: string, today: string) {
  const a = Date.parse(`${today}T00:00:00Z`);
  const b = Date.parse(`${date}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function occasionText(o: Occasion, lang: Lang) {
  const ar = lang === "ar";
  return {
    name: ar ? o.name_ar : o.name_en,
    headline: (ar ? o.headline_ar : o.headline_en) || "",
    flourish: (ar ? o.flourish_ar : o.flourish_en) || "",
    subline: (ar ? o.subline_ar : o.subline_en) || "",
  };
}

/** The collection an occasion leads to, from its CTA path (e.g. "/sets" → "SETS"). */
const CATEGORY_BY_PATH: Record<string, string> = {
  "/moissanite": "MOISSANITE",
  "/sets": "SETS",
  "/rings": "RINGS",
  "/chains": "CHAINS",
  "/bracelets": "BRACELETS",
  "/earrings": "EARRINGS",
};

export function occasionCategory(o: Occasion) {
  const path = (o.cta_href || "").split(/[?#]/)[0].replace(/\/$/, "");
  return CATEGORY_BY_PATH[path] ?? "MOISSANITE";
}

/** Midnight at the start of the occasion day, in Palestine's time zone. */
export function occasionStart(o: Occasion) {
  const guess = new Date(`${o.occasion_date}T00:00:00Z`);
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Hebron", timeZoneName: "longOffset" })
      .formatToParts(guess)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+02:00";
  const m = offset.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  const mins = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 120;
  return guess.getTime() - mins * 60_000;
}

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** 2026 → MMXXVI, for the engraved seal. */
export function roman(n: number) {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) (out += s), (n -= v);
  return out;
}
