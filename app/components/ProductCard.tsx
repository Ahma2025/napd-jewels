"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Tilt from "./Tilt";
import OccasionMotif from "./OccasionMotif";
import { useLang } from "../context/LangContext";
import { useOccasion } from "../context/OccasionContext";
import { THEMES } from "@/lib/occasion";
import {
  productName,
  formatPrice,
  priceInfo,
  type ListingProduct,
} from "@/lib/productDisplay";

type Props = {
  product: ListingProduct;
  sizes?: string;
  className?: string;
};

export default function ProductCard({
  product,
  sizes = "(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw",
  className = "",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const { lang } = useLang();
  const occasion = useOccasion();
  const name = productName(product, lang);
  const { hasDiscount, pct, original, final } = priceInfo(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`napd-card group block rounded-md focus-visible:outline-none ${className}`}
    >
      <Tilt max={6} lift={6}>
      <div
        className={`napd-card-media relative w-full aspect-square overflow-hidden ${
          loaded ? "bg-[#F7F6F3]" : "napd-skeleton"
        }`}
      >
        <div className="absolute inset-[9%]">
          <Image
            src={product.image_url || "/hero.jpeg"}
            alt={name}
            fill
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            className="napd-card-img object-contain object-center mix-blend-multiply"
          />
        </div>

        {occasion && (
          <OccasionMotif
            motif={THEMES[occasion.theme]?.motif ?? "star"}
            strokeWidth={1.4}
            className="napd-card-motif absolute end-3 top-3 h-4 w-4 text-napd-accent"
          />
        )}
        {hasDiscount && (
          <span className="napd-caps absolute start-3 top-3 bg-napd-ink px-2 py-1 text-[10px] tracking-[0.12em] text-napd-ivory tabular-nums">
            <bdi dir="ltr">−{pct}%</bdi>
          </span>
        )}
        <span aria-hidden="true" className="napd-shine pointer-events-none absolute inset-0" />
      </div>
      </Tilt>

      <div className="mt-5 space-y-2 px-1 text-center">
        <p className="napd-caps text-[10px] text-napd-muted">NAPD Jewels</p>
        <p className="napd-card-name truncate text-[12.5px] leading-snug text-napd-ink">
          {name}
        </p>
        <p className="flex items-baseline justify-center gap-2.5 tabular-nums">
          <span className="text-[13px] tracking-[0.14em] text-napd-ink/70">
            {formatPrice(final)}
          </span>
          {hasDiscount && (
            <span className="text-[12px] tracking-[0.1em] text-napd-muted/80 line-through">
              {formatPrice(original)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="napd-skeleton w-full aspect-square" />
      <div className="mt-5 flex flex-col items-center space-y-2.5">
        <div className="napd-skeleton h-2.5 w-1/3" />
        <div className="napd-skeleton h-3 w-3/4" />
        <div className="napd-skeleton h-3 w-1/4" />
      </div>
    </div>
  );
}
