"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LANG_COOKIE, translate, type DictKey, type Lang } from "@/lib/i18n";

type LangValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    // remember for a year; the server reads it to render the right language
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback((key: DictKey) => translate(lang, key), [lang]);

  return (
    <LangContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const v = useContext(LangContext);
  if (!v) throw new Error("useLang must be used inside LangProvider");
  return v;
}
