"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Phone } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useOccasion } from "../context/OccasionContext";
import { OccasionSeal } from "./OccasionOrnament";
import { THEMES, occasionText, roman } from "@/lib/occasion";

const SOCIAL = {
  instagram: "https://instagram.com/napd.ps",
  facebook: "https://facebook.com/napd.ps",
  whatsapp: "https://wa.me/972593255260",
};

export default function Footer() {
  const { lang, t } = useLang();
  const occasion = useOccasion();
  return (
    <footer className="pt-20 pb-12 border-t border-white/10" style={{ backgroundColor: "rgb(var(--c-ink))" }}>
      <div className="max-w-[1200px] mx-auto px-6 text-center">

        {occasion && (
          <div className="mb-14 flex flex-col items-center gap-5 text-napd-goldsoft">
            <OccasionSeal
              motif={THEMES[occasion.theme]?.motif ?? "star"}
              text={`NAPD JEWELS · ${occasion.name_en.toUpperCase()} · ${roman(Number(occasion.occasion_date.slice(0, 4)))} · `}
              className="relative h-36 w-36 opacity-80"
            />
            <p className="napd-caps text-[11px] text-napd-ivory/60">{occasionText(occasion, lang).name}</p>
          </div>
        )}

        {/* Brand */}
        <div className="flex justify-center">
          <Image
            src="/napd-logo.png"
            alt="NAPD Jewels"
            width={183}
            height={160}
            className="h-16 w-auto"
          />
        </div>

        {/* Social Icons */}
        <div className="mt-8 flex items-center justify-center gap-10">
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="Facebook"
          >
            <Facebook
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-napd-gold"
            />
          </a>

          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="Instagram"
          >
            <Instagram
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-napd-gold"
            />
          </a>

          <a
            href={SOCIAL.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="WhatsApp"
          >
            <Phone
              size={22}
              strokeWidth={1.5}
              className="text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-napd-gold"
            />
          </a>
        </div>

        {/* Links */}
        <nav className="napd-caps mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[12px] text-white/70">
          <Link href="/contact" className="hover:text-napd-gold">
            {t("footer.contact")}
          </Link>
          <Link href="/about" className="hover:text-napd-gold">
            {t("footer.about")}
          </Link>
          <Link href="/faqs" className="hover:text-napd-gold">
            {t("footer.faqs")}
          </Link>
          <Link href="/shipping-policy" className="hover:text-napd-gold">
            {t("footer.shipping")}
          </Link>
          <Link href="/exchange-policy" className="hover:text-napd-gold">
            {t("footer.exchange")}
          </Link>
          <Link href="/privacy-policy" className="hover:text-napd-gold">
            {t("footer.privacy")}
          </Link>
        </nav>

        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
          <span>{t("footer.rights")}</span>
          <span>{t("footer.silver")}</span>
        </div>
      </div>
    </footer>
  );
}
