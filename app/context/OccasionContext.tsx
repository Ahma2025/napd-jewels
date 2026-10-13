"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { OCCASION_COLUMNS, type Occasion } from "@/lib/occasion";

const OccasionContext = createContext<Occasion | null>(null);

/**
 * The current occasion, chosen on the server. `?occasion=<slug or theme>` in
 * the URL previews any occasion's look before its dates arrive.
 */
export function OccasionProvider({ initial, children }: { initial: Occasion | null; children: ReactNode }) {
  const [occasion, setOccasion] = useState<Occasion | null>(initial);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("occasion");
    // only plain slugs, so the value can't change the filter
    if (!preview || !/^[a-z0-9_-]{1,40}$/.test(preview)) return;
    let cancelled = false;
    supabase
      .from("occasions")
      .select(OCCASION_COLUMNS)
      .or(`slug.eq.${preview},theme.eq.${preview}`)
      .order("occasion_date")
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data?.[0]) setOccasion(data[0] as Occasion);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The palette lives on <html data-occasion>, so a preview re-dresses every page too.
  useEffect(() => {
    const root = document.documentElement;
    if (occasion) root.dataset.occasion = occasion.theme;
    else delete root.dataset.occasion;
  }, [occasion]);

  return <OccasionContext.Provider value={occasion}>{children}</OccasionContext.Provider>;
}

export function useOccasion() {
  return useContext(OccasionContext);
}
