"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { useLang } from "../context/LangContext";
import type { DictKey } from "@/lib/i18n";

type Banner = { href: string; image: string; eyebrow: DictKey; title: DictKey };

/** One photograph across the full width, the words set over its quiet side. */
function Panel({ b, wide }: { b: Banner; wide?: boolean }) {
  const { t } = useLang();
  return (
    <Link
      href={b.href}
      className={`napd-banner group relative isolate block overflow-hidden ${
        wide ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/8]" : "aspect-[4/5] md:aspect-[5/4]"
      }`}
    >
      <Image
        src={b.image}
        alt=""
        fill
        sizes={wide ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
        className="napd-banner-img -z-20 object-cover"
      />
      <span aria-hidden="true" className="napd-banner-shade absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-12 text-center text-white md:pb-16">
        <Reveal>
          <p className="napd-caps text-[11.5px] font-medium text-white/90">{t(b.eyebrow)}</p>
          <h2 className="napd-banner-title mt-4 text-white">{t(b.title)}</h2>
          <span className="napd-pill mt-7 !bg-white/95 !text-napd-ink group-hover:!bg-napd-ink group-hover:!text-white">
            {t("banner.discover")}
          </span>
        </Reveal>
      </div>
    </Link>
  );
}

export function WideBanner() {
  return (
    <section aria-label="Sets" className="bg-white">
      <Panel wide b={{ href: "/sets", image: "/banners/sets.webp", eyebrow: "banner.sets.eyebrow", title: "banner.sets.title" }} />
    </section>
  );
}

export function SplitBanners() {
  return (
    <section aria-label="Moissanite & Charms" className="grid bg-white md:grid-cols-2">
      <Panel b={{ href: "/moissanite", image: "/banners/moissanite.webp", eyebrow: "banner.moissanite.eyebrow", title: "banner.moissanite.title" }} />
      <Panel b={{ href: "/pandora", image: "/banners/pandora.webp", eyebrow: "banner.pandora.eyebrow", title: "banner.pandora.title" }} />
    </section>
  );
}
